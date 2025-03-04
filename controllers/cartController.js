const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ShippingSettings = require('../models/Shipping'); //
exports.addToCart = async (req, res) => {
    const { productId } = req.body;

    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to add items to your cart." });
    }

    try {
        // Update lastActive for authenticated user
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Find the user's cart
        let cart = await Cart.findOne({ user: req.user.userId });

        // If the cart does not exist, create a new one
        if (!cart) {
            cart = new Cart({
                user: req.user.userId,
                items: [],
                totalPrice: 0
            });
        }

        // Check if the product is already in the cart
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

        // Calculate total price
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save the updated cart
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
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).render("auth/login", { error: "Please log in to view your cart." });
    }

    try {
        // Fetch cart with populated product details
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

        // Fetch shipping and tax settings
        const shippingSettings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };

        // Handle empty cart case
        if (!cart || cart.items.length === 0) {
            return res.render("cart/cart", { 
                user: req.user,
                cart: [],
                totalAmount: 0,
                shippingSettings,
                errorMessage: null
            });
        }

        // Calculate subtotal (price * quantity for all items)
        const subtotal = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        // Calculate tax (applied to subtotal)
        const tax = subtotal * (shippingSettings.taxRate / 100);

        // Calculate shipping (applied once)
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;

        // Calculate total amount (subtotal + tax + shipping)
        const totalAmount = subtotal + tax + shipping;

        // Render cart page with data
        res.render("cart/cart", { 
            user: req.user,
            cart: cart.items,
            subtotal: subtotal.toFixed(2),  // Pass subtotal separately for display
            shippingSettings,              // Pass shipping settings for display
            tax: tax.toFixed(2),          // Pass tax for display
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