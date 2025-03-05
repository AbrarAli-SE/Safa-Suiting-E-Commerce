const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ShippingSettings = require('../models/Shipping'); //
const Coupon = require('../models/Coupon');

exports.addToCart = async (req, res) => {
    const { productId } = req.body;

    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to add items to your cart." });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            cart = new Cart({
                user: req.user.userId,
                items: [],
                totalPrice: 0,
                discount: 0,
                finalTotal: 0
            });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                product: product._id,
                name: product.name,
                img: product.image,
                price: product.price,
                quantity: 1
            });
        }

        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };
        let shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        let tax = cart.totalPrice * (shippingSettings.taxRate / 100);
        let discount = cart.discount || 0;
    
        if (cart.coupon) {
            const coupon = await Coupon.findById(cart.coupon);
            if (coupon) {
                switch (coupon.coupon_type) {
                    case 'shipping_free': shipping = 0; break;
                    case 'tax_free': tax = 0; break;
                    case 'half_rate': discount = cart.totalPrice * 0.5; break;
                }
            }
        }
    
        cart.finalTotal = cart.totalPrice + shipping + tax - discount;
        await cart.save();
    
        return res.json({
            success: true,
            message: "Product added to cart successfully!",
            cart
        });

    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};



exports.renderCart = async (req, res) => {
    if (!req.user || !req.user.userId) {
        console.error("User not authenticated or userId missing");
        return res.status(401).render("auth/login", { error: "Please log in to view your cart." });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.render("cart/cart", { 
                user: req.user,
                cart: [],
                subtotal: 0,
                shipping: 0,
                tax: 0,
                totalAmount: 0,
                shippingSettings,
                appliedCoupon: null,
                errorMessage: null
            });
        }

        const subtotal = cart.totalPrice || 0;
        let shipping = shippingSettings.shippingOption === 'rate' ? (shippingSettings.shippingRate || 0) : 0;
        let tax = subtotal * ((shippingSettings.taxRate || 0) / 100);
        let discount = cart.discount || 0;

        if (cart.coupon) {
            try {
                const coupon = await Coupon.findById(cart.coupon);
                if (coupon) {
                    switch (coupon.coupon_type) {
                        case 'shipping_free': shipping = 0; break;
                        case 'tax_free': tax = 0; break;
                        case 'half_rate': discount = subtotal * 0.5; break;
                        default: console.warn(`Unknown coupon type: ${coupon.coupon_type}`);
                    }
                    cart.discount = discount;
                    cart.finalTotal = subtotal + shipping + tax - discount;
                    await cart.save();
                } else {
                    console.warn(`Coupon not found for ID: ${cart.coupon}`);
                }
            } catch (couponError) {
                console.error("Error fetching coupon:", couponError);
            }
        }

        const totalAmount = cart.finalTotal || (subtotal + shipping + tax - discount);

        res.render("cart/cart", { 
            user: req.user,
            cart: cart.items,
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingSettings,
            appliedCoupon: cart.appliedCouponCode || null,
            errorMessage: null
        });

    } catch (error) {
        console.error("❌ Cart Page Error:", error.message, error.stack);
        res.status(500).render("cart/cart", { 
            user: req.user || null,
            cart: [],
            subtotal: 0,
            shipping: 0,
            tax: 0,
            totalAmount: 0,
            shippingSettings: { shippingOption: 'free', shippingRate: 0, taxRate: 0 },
            appliedCoupon: null,
            errorMessage: "Server error. Please try again."
        });
    }
};


exports.updateCart = async (req, res) => {
    const { updatedItems } = req.body;

    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to update your cart." });
    }

    try {
        // Update lastActive for authenticated user
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Find the cart
        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        // Update the quantity of each item in the cart
        updatedItems.forEach(updatedItem => {
            const item = cart.items.find(item => item._id.toString() === updatedItem.itemId);
            if (item) {
                item.quantity = updatedItem.quantity;
            }
        });

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();

        // Clean up the response
        const updatedCart = cart.toObject();
        updatedCart.items = updatedCart.items.map(item => {
            item._id = item._id.toString();
            return item;
        });

        return res.json({ success: true, cart: updatedCart });

    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};


exports.deleteItem = async (req, res) => {
    const { itemId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to remove items from your cart." });
    }

    try {
        // Update lastActive for authenticated user
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Find the cart
        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        // Remove the item from the cart
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();

        return res.json({ success: true, message: "Item removed from cart.", cart });

    } catch (error) {
        console.error("Delete Item Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};



exports.applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        if (!req.user || !req.user.userId) {
            console.error("User not authenticated or userId missing");
            return res.status(401).json({ success: false, message: "Please log in to apply a coupon." });
        }

        console.log(`Applying coupon ${couponCode} for user ${req.user.userId}`);

        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
        if (!cart) {
            console.warn(`Cart not found for user ${req.user.userId}`);
            return res.status(404).json({ success: false, message: "Cart not found" });
        }
        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        if (cart.appliedCouponCode === couponCode) {
            return res.status(400).json({ success: false, message: "Coupon already applied to this cart" });
        }

        const coupon = await Coupon.findOne({ coupon_code: couponCode });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        const currentDate = new Date();
        if (currentDate > new Date(coupon.expiry_date)) {
            return res.status(400).json({ success: false, message: "This coupon has expired" });
        }
        if (coupon.start_date && currentDate < new Date(coupon.start_date)) {
            return res.status(400).json({ success: false, message: "This coupon is not valid yet" });
        }
        if (coupon.usage_limit && (coupon.usage_count || 0) >= coupon.usage_limit) {
            return res.status(400).json({ success: false, message: "This coupon has reached its usage limit" });
        }
        if (coupon.min_order_value && (cart.totalPrice || 0) < coupon.min_order_value) {
            return res.status(400).json({ success: false, message: `Minimum order value of Rs ${coupon.min_order_value} required` });
        }

        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };

        const subtotal = cart.totalPrice || 0;
        let shipping = shippingSettings.shippingOption === 'rate' ? (shippingSettings.shippingRate || 0) : 0;
        let tax = subtotal * ((shippingSettings.taxRate || 0) / 100);
        let discount = 0;
        let discountMessage = "";

        switch (coupon.coupon_type) {
            case 'shipping_free':
                shipping = 0;
                discountMessage = "Free shipping applied!";
                break;
            case 'tax_free':
                tax = 0;
                discountMessage = "Tax-free discount applied!";
                break;
            case 'half_rate':
                discount = subtotal * 0.5;
                discountMessage = "50% discount applied!";
                break;
            default:
                console.warn(`Unknown coupon type: ${coupon.coupon_type}`);
        }

        const total = subtotal + shipping + tax - discount;

        if (!cart.coupon) {
            coupon.usage_count = (coupon.usage_count || 0) + 1;
            await coupon.save();
            console.log(`Coupon ${couponCode} usage_count updated to ${coupon.usage_count}`);
        }

        cart.coupon = coupon._id;
        cart.appliedCouponCode = couponCode;
        cart.discount = discount;
        cart.finalTotal = total;
        await cart.save();

        res.status(200).json({
            success: true,
            message: discountMessage,
            cart: {
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                tax: tax.toFixed(2),
                discount: discount.toFixed(2),
                total: total.toFixed(2),
                appliedCoupon: couponCode,
                items: cart.items
            },
            remainingUses: coupon.usage_limit ? coupon.usage_limit - coupon.usage_count : 'Unlimited'
        });

    } catch (error) {
        console.error('Error applying coupon:', error.message, error.stack);
        res.status(500).json({ 
            success: false, 
            message: "Server error while applying coupon",
            error: error.message // Include error message for debugging
        });
    }
};




// Update removeCoupon to not affect usage_count
exports.removeCoupon = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Please log in to remove coupon" });
        }

        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };

        const subtotal = cart.totalPrice;
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const total = subtotal + shipping + tax;

        // Reset cart coupon fields without affecting coupon usage_count
        cart.coupon = null;
        cart.appliedCouponCode = null;
        cart.discount = 0;
        cart.finalTotal = total;
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Coupon removed successfully",
            cart: {
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                tax: tax.toFixed(2),
                discount: "0.00",
                total: total.toFixed(2),
                appliedCoupon: null,
                items: cart.items
            }
        });
    } catch (error) {
        console.error('Error removing coupon:', error);
        res.status(500).json({ success: false, message: "Server error while removing coupon" });
    }
};






// controllers/cartController.js

// ... (other imports and existing functions remain the same)

// exports.renderCheckout = async (req, res) => {
//     if (!req.user) {
//         return res.status(401).render("auth/login", { error: "Please log in to proceed to checkout." });
//     }

//     try {
//         const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
//         const shippingSettings = await ShippingSettings.findOne() || {
//             shippingOption: 'free',
//             shippingRate: 0,
//             taxRate: 0
//         };

//         if (!cart || cart.items.length === 0) {
//             return res.redirect("/cart"); // Redirect to cart if empty
//         }

//         const subtotal = cart.totalPrice;
//         let shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
//         let tax = subtotal * (shippingSettings.taxRate / 100);
//         let discount = cart.discount || 0;

//         if (cart.coupon) {
//             const coupon = await Coupon.findById(cart.coupon);
//             if (coupon) {
//                 switch (coupon.coupon_type) {
//                     case 'shipping_free': shipping = 0; break;
//                     case 'tax_free': tax = 0; break;
//                     case 'half_rate': discount = subtotal * 0.5; break;
//                 }
//             }
//         }

//         const totalAmount = subtotal + shipping + tax - discount;

//         res.render("cart/checkout", { 
//             user: req.user,
//             cart: cart.items,
//             subtotal: subtotal.toFixed(2),
//             shipping: shipping.toFixed(2),
//             tax: tax.toFixed(2),
//             totalAmount: totalAmount.toFixed(2),
//             shippingSettings,
//             appliedCoupon: cart.appliedCouponCode
//         });

//     } catch (error) {
//         console.error("❌ Checkout Render Error:", error);
//         res.status(500).render("cart/cart", { 
//             user: req.user,
//             cart: [],
//             subtotal: 0,
//             shipping: 0,
//             tax: 0,
//             totalAmount: 0,
//             shippingSettings: { shippingOption: 'free', shippingRate: 0, taxRate: 0 },
//             appliedCoupon: null,
//             errorMessage: "Server error. Please try again."
//         });
//     }
// };

// ... (rest of your existing controller functions)