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
        // Recalculate final total if a coupon is applied
        if (cart.coupon) {
            const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };
            const coupon = await Coupon.findById(cart.coupon);
            let shippingCost = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
            let taxRate = shippingSettings.taxRate / 100;
            let discount = cart.discount;

            if (coupon) {
                switch (coupon.coupon_type) {
                    case 'shipping_free': shippingCost = 0; break;
                    case 'tax_free': taxRate = 0; break;
                    case 'half_rate': discount = cart.totalPrice * 0.5; break;
                }
            }
            const tax = cart.totalPrice * taxRate;
            cart.finalTotal = cart.totalPrice + shippingCost + tax - discount;
        } else {
            cart.finalTotal = cart.totalPrice; // No coupon, finalTotal = totalPrice
        }

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



// ✅ Get User Cart

exports.renderCart = async (req, res) => {
    if (!req.user) {
        return res.status(401).render("auth/login", { error: "Please log in to view your cart." });
    }

    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };

        if (!cart || cart.items.length === 0) {
            return res.render("cart/cart", { 
                user: req.user,
                cart: [],
                totalAmount: 0,
                shippingSettings,
                errorMessage: null
            });
        }

        const subtotal = cart.totalPrice; // Use stored subtotal
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const totalAmount = cart.finalTotal || (subtotal + tax + shipping); // Use stored finalTotal if available

        res.render("cart/cart", { 
            user: req.user,
            cart: cart.items,
            subtotal: subtotal.toFixed(2),
            shippingSettings,
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            errorMessage: null
        });

    } catch (error) {
        console.error("❌ Cart Page Error:", error);
        res.status(500).render("cart/cart", { 
            user: req.user,
            cart: [],
            subtotal: 0,
            shippingSettings: { shippingOption: 'free', shippingRate: 0, taxRate: 0 },
            tax: 0,
            totalAmount: 0,
            errorMessage: "Server error. Please try again."
        });
    }
};

exports.renderCheckout = async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).render("auth/login", { error: "Please log in to proceed to checkout." });
    }

    try {
        // Fetch user cart with populated product details
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.redirect("/user/cart"); // Redirect if cart is empty
        }

        res.render("user/checkout", { user: req.user, cart: cart.items });

    } catch (error) {
        console.error("❌ Checkout Render Error:", error);
        res.status(500).send("Server error");
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

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Please log in to apply a coupon."
            });
        }

        const userId = req.user.userId;

        const coupon = await Coupon.findOne({ coupon_code: couponCode });
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon code not found or has been deleted"
            });
        }

        const currentDate = new Date();
        if (currentDate > new Date(coupon.expiry_date)) {
            return res.status(400).json({
                success: false,
                message: "This coupon has expired"
            });
        }

        if (currentDate < new Date(coupon.start_date)) {
            return res.status(400).json({
                success: false,
                message: "This coupon is not valid yet"
            });
        }

        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({
                success: false,
                message: "This coupon has reached its usage limit"
            });
        }

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found for this user"
            });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const subtotal = cart.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);

        if (subtotal < coupon.min_order_value) {
            return res.status(400).json({
                success: false,
                message: `Minimum order value of Rs ${coupon.min_order_value} required for this coupon`
            });
        }

        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };

        let discount = 0;
        let shippingCost = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        let taxRate = shippingSettings.taxRate / 100;
        let discountMessage = "";

        switch (coupon.coupon_type) {
            case 'shipping_free':
                shippingCost = 0;
                discountMessage = "Free shipping applied!";
                break;
            case 'tax_free':
                taxRate = 0;
                discountMessage = "Tax-free discount applied!";
                break;
            case 'half_rate':
                discount = subtotal * 0.5;
                discountMessage = "50% discount applied!";
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid coupon type"
                });
        }

        const tax = subtotal * taxRate;
        const totalBeforeDiscount = subtotal + shippingCost + tax;
        const total = totalBeforeDiscount - discount;

        // Update coupon usage
        coupon.used_count = (coupon.used_count || 0) + 1;
        await coupon.save();

        // Update cart with coupon info and totals
        cart.coupon = coupon._id;
        cart.discount = discount;
        cart.totalPrice = subtotal;  // Store subtotal as totalPrice
        cart.finalTotal = total;     // Store final total after discount
        await cart.save();

        res.status(200).json({
            success: true,
            message: discountMessage,
            cart: {
                subtotal: subtotal.toFixed(2),
                shipping: shippingCost.toFixed(2),
                tax: tax.toFixed(2),
                discount: discount.toFixed(2),
                total: total.toFixed(2),
                appliedCoupon: coupon.coupon_code,
                items: cart.items
            }
        });

    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({
            success: false,
            message: "Server error while applying coupon"
        });
    }
};