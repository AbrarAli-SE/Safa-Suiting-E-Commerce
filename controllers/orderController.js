const Order = require("../models/Order");
const Product = require("../models/Product");
const CancelledOrder = require("../models/CancelledOrder");
exports.renderOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("items.product");

        res.render("orders/orders", {
            user: req.user,
            orders,
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Orders Page Error:", error.message);
        res.status(500).render("orders/orders", {
            user: req.user || null,
            orders: [],
            errorMessage: "Server error. Please try again."
        });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      console.log(`Cancel request - orderId: ${orderId}, userId: ${req.user.userId}, reason: ${reason}`);
      
      const order = await Order.findOne({ orderId, user: req.user.userId });
  
      if (!order) {
        console.log(`Order ${orderId} not found for user ${req.user.userId}`);
        return res.status(404).json({ success: false, message: "Order not found." });
      }
  
      const orderTime = new Date(order.createdAt).getTime();
      const fiveHoursLater = orderTime + (5 * 60 * 60 * 1000);
      const now = Date.now();
  
      console.log(`Order time: ${orderTime}, Five hours later: ${fiveHoursLater}, Now: ${now}`);
      if (now > fiveHoursLater || order.status !== 'pending') {
        console.log(`Cancellation denied - Time elapsed: ${now > fiveHoursLater}, Status: ${order.status}`);
        return res.status(400).json({ success: false, message: "Order cannot be cancelled after 5 hours or if it’s no longer pending." });
      }
  
      // Increase product quantities
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        } else {
          console.warn(`Product ${item.product} not found during cancellation`);
        }
      }
  
      // Create a cancelled order record with reason
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
        cancellationReason: reason
      });
  
      await cancelledOrder.save();
      await Order.deleteOne({ orderId, user: req.user.userId });
  
      console.log(`Order ${orderId} cancelled and moved to CancelledOrder collection`);
      res.json({ success: true, message: "Order cancelled successfully and inventory updated." });
    } catch (error) {
      console.error("❌ Cancel Order Error:", error.message);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  };

exports.renderCancelledOrders = async (req, res) => {
    try {
        console.log(`Fetching cancelled orders for user: ${req.user.userId}`);
        const cancelledOrders = await CancelledOrder.find({ user: req.user.userId })
            .sort({ cancelledAt: -1 })
            .populate("items.product");

        console.log(`Found ${cancelledOrders.length} cancelled orders`);
        res.render("orders/cancelled-orders", {
            user: req.user,
            cancelledOrders,
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Cancelled Orders Page Error:", error.message);
        console.error("Full error:", error);
        res.status(500).render("orders/cancelled-orders", {
            user: req.user || null,
            cancelledOrders: [],
            errorMessage: "Server error. Please try again."
        });
    }
};