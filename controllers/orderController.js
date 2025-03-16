const Order = require("../models/Order");
const Product = require("../models/Product");
const Payment = require('../models/Payment'); // Import Payment model for managing payments
const CancelledOrder = require("../models/CancelledOrder");

// Render user's active orders page
exports.renderOrders = async (req, res) => {
    try {
        // Fetch all active orders for the authenticated user, sorted by creation date (newest first)
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("items.product"); // Populate product details for each item

        // Render the orders page with user data and fetched orders
        res.render("orders/user-orders", {
            user: req.user,
            orders,
            errorMessage: null
        });
    } catch (error) {
        // Log error details for debugging
        console.error("❌ Orders Page Error:", error.message);
        // Render the page with an error message if fetching fails
        res.status(500).render("orders/user-orders", {
            user: req.user || null, // Ensure user is passed even on error
            orders: [], // Empty array to prevent undefined errors in template
            errorMessage: "Server error. Please try again."
        });
    }
};

// Cancel an order and update inventory
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        // Find the order by its custom orderId and user
        const order = await Order.findOne({ orderId, user: req.user.userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Check if cancellation is allowed (within 5 hours and pending status)
        const orderTime = new Date(order.createdAt).getTime();
        const fiveHoursLater = orderTime + (5 * 60 * 60 * 1000); // 5 hours in milliseconds
        const now = Date.now();

        if (now > fiveHoursLater || order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled after 5 hours or if it’s no longer pending."
            });
        }

        // Restore product quantities to inventory
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity; // Add back the cancelled quantity
                await product.save();
            } else {
                console.warn(`Product ${item.product} not found during cancellation`);
            }
        }

        // Create a record in CancelledOrder collection with cancellation reason
        const cancelledOrder = new CancelledOrder({
            user: order.user,
            orderId: order.orderId,
            items: order.items,
            billingInfo: order.billingInfo,
            paymentMethod: order.paymentMethod,
            subtotal: order.subtotal,
            shipping: order.shipping,
            tax: order.tax,
            totalAmount: order.totalAmount,
            originalCreatedAt: order.createdAt,
            cancellationReason: reason // Store the reason provided by the user
        });
        await cancelledOrder.save();

        // Remove the associated payment record
        const payment = await Payment.findOneAndDelete({ order: order._id });
        if (!payment) {
            console.warn(`No payment found for order ${orderId}`);
        }

        // Delete the original order from the Order collection
        await Order.deleteOne({ orderId, user: req.user.userId });

        // Respond with success message
        res.json({ success: true, message: "Order and associated payment cancelled successfully, inventory updated." });
    } catch (error) {
        // Log error details and respond with failure message
        console.error("❌ Cancel Order Error:", error.message);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// Render user's cancelled orders page
exports.renderCancelledOrders = async (req, res) => {
    try {
        // Fetch all cancelled orders for the authenticated user, sorted by cancellation date (newest first)
        const cancelledOrders = await CancelledOrder.find({ user: req.user.userId })
            .sort({ cancelledAt: -1 })
            .populate("items.product"); // Populate product details for each item

        // Render the cancelled orders page with user data and fetched orders
        res.render("orders/cancelled-orders", {
            user: req.user,
            cancelledOrders,
            errorMessage: null
        });
    } catch (error) {
        // Log error details for debugging, including full error object
        console.error("❌ Cancelled Orders Page Error:", error.message);
        console.error("Full error:", error);

        // Render the page with an error message if fetching fails
        res.status(500).render("orders/cancelled-orders", {
            user: req.user || null, // Ensure user is passed even on error
            cancelledOrders: [], // Empty array to prevent undefined errors in template
            errorMessage: "Server error. Please try again."
        });
    }
};