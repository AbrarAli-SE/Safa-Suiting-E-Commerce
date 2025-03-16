const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ShippingSettings = require('../models/Shipping');
const Payment = require('../models/Payment');
const Order = require("../models/Order");
const sendEmail = require("../utils/emailConfig"); // Utility for sending emails
const { generateOrderConfirmationEmail } = require('../utils/emailTemplates'); // Import email template

// Generate a unique 6-digit order ID
function generateOrderId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // Random 6-digit number
    return `ORD-${randomNum}`; // Prefix with "ORD-" for readability
}

// Add product to user's cart
exports.addToCart = async (req, res) => {
    const { productId } = req.body;
    // Ensure user is authenticated
    if (!req.user) return res.status(401).json({ success: false, message: "Please log in to add items to your cart." });

    try {
        // Update user's last active timestamp
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });

        // Find or create user's cart
        let cart = await Cart.findOne({ user: req.user.userId }) || new Cart({
            user: req.user.userId,
            items: [],
            totalPrice: 0,
            finalTotal: 0
        });

        // Check if product is already in cart
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += 1; // Increment quantity if exists
        } else {
            // Add new item to cart
            cart.items.push({
                product: product._id,
                name: product.name,
                img: product.image,
                price: product.price,
                quantity: 1
            });
        }

        await updateCartTotals(cart); // Recalculate totals
        await cart.save(); // Save updated cart
        return res.json({ success: true, message: "Product added to cart successfully!", cart });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// Render cart page
exports.renderCart = async (req, res) => {
    // Check if user is logged in
    if (!req.user?.userId) return res.status(401).render("auth/login", { error: "Please log in to view your cart." });

    try {
        // Fetch user's cart with populated product details
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        // Get shipping settings or use defaults
        const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };

        // Handle empty cart case
        if (!cart?.items?.length) {
            return res.render("cart/cart", {
                user: req.user,
                cart: [],
                subtotal: 0,
                shipping: 0,
                tax: 0,
                totalAmount: 0,
                shippingSettings,
                errorMessage: null
            });
        }

        // Calculate totals for display
        const subtotal = cart.totalPrice;
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const totalAmount = subtotal + shipping + tax;

        // Render cart page with calculated values
        res.render("cart/cart", {
            user: req.user,
            cart: cart.items,
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingSettings,
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Cart Page Error:", error.message);
        // Render error state if something goes wrong
        res.status(500).render("cart/cart", {
            user: req.user || null,
            cart: [],
            subtotal: 0,
            shipping: 0,
            tax: 0,
            totalAmount: 0,
            shippingSettings: { shippingOption: 'free', shippingRate: 0, taxRate: 0 },
            errorMessage: "Server error. Please try again."
        });
    }
};

// Update cart items based on user input
exports.updateCart = async (req, res) => {
    const { updatedItems } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Please log in to update your cart." });

    try {
        // Update user's last active timestamp
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Fetch cart with product details
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

        // Update cart items with new quantities
        const updatedCartItems = cart.items.map(item => {
            const updatedItem = updatedItems.find(i => i.itemId === item._id.toString());
            const requestedQuantity = updatedItem ? Math.max(1, parseInt(updatedItem.quantity)) : item.quantity;
            const availableQuantity = item.product.quantity;

            return {
                _id: item._id,
                product: item.product._id,
                name: item.name || item.product.name,
                img: item.img || item.product.image,
                price: item.price || item.product.price,
                quantity: requestedQuantity,
                availableQuantity: availableQuantity
            };
        });

        // Check for stock availability
        const stockIssues = updatedCartItems.filter(item => item.quantity > item.availableQuantity);
        if (stockIssues.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some items exceed available stock",
                cart: { items: updatedCartItems },
                stockIssues: stockIssues.map(item => ({
                    itemId: item._id,
                    requested: item.quantity,
                    available: item.availableQuantity
                }))
            });
        }

        // Apply updated items to cart
        cart.items = updatedCartItems.map(item => ({
            product: item.product,
            name: item.name,
            img: item.img,
            price: item.price,
            quantity: item.quantity
        }));

        await updateCartTotals(cart); // Recalculate totals
        await cart.save(); // Save changes

        // Prepare response with updated cart details
        const cartResponse = cart.toObject();
        cartResponse.items = updatedCartItems;

        return res.json({
            success: true,
            cart: cartResponse,
            shipping: cart.shipping,
            tax: cart.tax,
            totalAmount: cart.finalTotal
        });
    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// Remove item from cart
exports.deleteItem = async (req, res) => {
    const { itemId } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Please log in to remove items from your cart." });

    try {
        // Update user's last active timestamp
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Find and modify cart
        const cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

        cart.items = cart.items.filter(item => item._id.toString() !== itemId); // Remove specified item
        await updateCartTotals(cart); // Recalculate totals
        await cart.save(); // Save updated cart

        return res.json({ 
            success: true, 
            message: "Item removed from cart.", 
            cart,
            shipping: cart.shipping,
            tax: cart.tax,
            totalAmount: cart.finalTotal
        });
    } catch (error) {
        console.error("Delete Item Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// Helper function to update cart totals based on shipping settings
async function updateCartTotals(cart) {
    const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0); // Calculate subtotal
    cart.shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0; // Apply shipping cost
    cart.tax = cart.totalPrice * (shippingSettings.taxRate / 100); // Calculate tax
    cart.finalTotal = cart.totalPrice + cart.shipping + cart.tax; // Calculate final total
}

// Render checkout page
exports.checkoutCart = async (req, res) => {
    if (!req.user?.userId) return res.status(401).render("auth/login", { error: "Please log in to checkout." });

    try {
        // Fetch cart and related data
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };
        const user = await User.findById(req.user.userId);

        // Redirect to cart if empty
        if (!cart?.items?.length) {
            return res.redirect("/user/cart");
        }

        // Calculate totals for display
        const subtotal = cart.totalPrice;
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const totalAmount = subtotal + shipping + tax;

        // Render checkout page with cart details and billing info
        res.render("cart/checkout", {
            user: req.user,
            cart: cart.items,
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingSettings,
            billingInfo: user.billingInfo || {}, // Pre-fill with saved billing info if available
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Checkout Page Error:", error.message);
        // Render error state if something goes wrong
        res.status(500).render("cart/checkout", {
            user: req.user || null,
            cart: [],
            subtotal: 0,
            shipping: 0,
            tax: 0,
            totalAmount: 0,
            shippingSettings: { shippingOption: 'free', shippingRate: 0, taxRate: 0 },
            billingInfo: {},
            errorMessage: "Server error. Please try again."
        });
    }
};

// Process checkout and create order
exports.processCheckout = async (req, res) => {
    try {
        const { firstName, streetAddress, apartment, townCity, phoneNumber, emailAddress, saveInfo } = req.body;
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };

        // Validate cart exists and has items
        if (!cart?.items?.length) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        // Prepare order items from cart
        const items = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity
        }));

        // Check stock availability for each item
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product ${item.product} not found`);
            if (product.quantity < item.quantity) throw new Error(`Insufficient quantity for ${product.name}. Available: ${product.quantity}`);
        }

        // Calculate order totals
        const subtotal = cart.totalPrice;
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const totalAmount = subtotal + shipping + tax;

        // Generate unique order ID
        let orderId = generateOrderId();
        let existingOrder = await Order.findOne({ orderId });
        while (existingOrder) {
            orderId = generateOrderId();
            existingOrder = await Order.findOne({ orderId });
        }

        // Create new order document
        const order = new Order({
            user: req.user.userId,
            orderId,
            items,
            billingInfo: { firstName, streetAddress, apartment, townCity, phoneNumber, emailAddress },
            paymentMethod: 'cash', // Default to cash payment
            subtotal,
            shipping,
            tax,
            totalAmount,
            status: 'pending'
        });

        await order.save(); // Save order to database

        // Create payment record
        const payment = new Payment({
            order: order._id,
            status: order.paymentMethod === 'cash' ? 'Pending' : 'Received'
        });
        await payment.save();

        // Update product quantities
        for (const item of items) {
            const product = await Product.findById(item.product);
            product.quantity -= item.quantity;
            await product.save();
        }

        // Save billing info to user profile if requested
        if (saveInfo) {
            const user = await User.findById(req.user.userId);
            user.billingInfo = { firstName, streetAddress, apartment, townCity, phoneNumber, emailAddress };
            await user.save();
        }

        // Clear user's cart after successful order
        await Cart.deleteOne({ user: req.user.userId });

        // Send order confirmation email using template
        const emailHtml = generateOrderConfirmationEmail({ order });
        await sendEmail(order.billingInfo.emailAddress, `Order Confirmation - ${order.orderId}`, emailHtml);

        // Redirect to order confirmation page
        res.redirect(`/user/cart/order-confirmation?orderSuccess=true`);
    } catch (error) {
        console.error("Process Checkout Error:", error);
        // Render checkout page with error message
        res.status(500).render("cart/checkout", {
            user: req.user || null,
            cart: [],
            subtotal: 0,
            shipping: 0,
            tax: 0,
            totalAmount: 0,
            shippingSettings: { shippingOption: 'free', shippingRate: 0, taxRate: 0 },
            errorMessage: error.message || "Server error. Please try again."
        });
    }
};

// Fetch user's latest order
const fetchLatestOrder = async (userId) => {
    try {
        // Find most recent order for user, sorted by creation date
        const order = await Order.findOne({ user: userId })
            .sort({ createdAt: -1 })
            .populate("items.product");
        return order;
    } catch (error) {
        console.error("❌ Fetch Latest Order Error:", error.message);
        throw error;
    }
};

// Render order confirmation page
exports.renderOrderConfirmation = async (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).render("auth/login", {
            error: "Please log in to view your order confirmation."
        });
    }

    try {
        // Get user's latest order
        const order = await fetchLatestOrder(req.user.userId);

        if (!order) {
            return res.status(404).render("cart/order-confirmation", {
                user: req.user,
                order: null,
                errorMessage: "No recent order found."
            });
        }

        // Render confirmation page with order details
        res.render("cart/order-confirmation", {
            user: req.user,
            order,
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Order Confirmation Render Error:", error.message);
        // Render error state if something goes wrong
        res.status(500).render("cart/order-confirmation", {
            user: req.user || null,
            order: null,
            errorMessage: "Server error. Please try again."
        });
    }
};