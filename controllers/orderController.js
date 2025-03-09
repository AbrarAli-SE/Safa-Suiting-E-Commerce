const Order = require("../models/Order");

exports.renderOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 }) // Newest orders first
            .populate("items.product");

        res.render("orders/orders", {
            user: req.user,
            orders,
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Orders Page Error:", error.message);
        res.status(500).render("orders", {
            user: req.user || null,
            orders: [],
            errorMessage: "Server error. Please try again."
        });
    }
};