const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Contact = require("../models/Contact");
const ShippingSettings = require('../models/Shipping'); //
const sendEmail = require('../utils/emailConfig');
const ContactInfo = require("../models/info");
const CancelledOrder = require("../models/CancelledOrder");
// Assuming you have an Order model
const Order = require('../models/Order'); // Adjust the path to your Order model
const Payment = require('../models/Payment');
const bcrypt = require("bcryptjs");
const Carousel = require("../models/Carousel");
const { uploadCarousel } = require("../config/multer-config");
const fs = require("fs").promises;
const path = require("path");

exports.uploadCarouselImages = async (req, res) => {
  uploadCarousel(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length < 1) {
        return res.status(400).json({ error: "Please upload at least 1 image." });
      }

      // Fetch existing carousel to preserve slides not being replaced
      const existingCarousel = await Carousel.findOne();
      let existingSlides = existingCarousel ? existingCarousel.slides : [];

      // Map uploaded files to new slides (only save image paths)
      const newSlides = req.files.map((file) => ({
        image: `/uploads/carousel/${file.filename}`, // Only store image path
      }));

      // Update the carousel with the new slides (replaces all existing ones)
      await Carousel.findOneAndUpdate(
        {},
        { slides: newSlides, updatedAt: Date.now() },
        { upsert: true, new: true }
      );

      // Clean up old images from disk if they were replaced
      if (existingSlides.length > 0) {
        const oldImagePaths = existingSlides.map(slide => path.join(__dirname, "../public", slide.image));
        const newImagePaths = newSlides.map(slide => path.join(__dirname, "../public", slide.image));
        const imagesToDelete = oldImagePaths.filter(path => !newImagePaths.includes(path));

        for (const imagePath of imagesToDelete) {
          try {
            await fs.unlink(imagePath);
          } catch (deleteError) {
            console.error("❌ File Delete Error:", deleteError);
          }
        }
      }

      res.status(200).json({ message: "Carousel updated successfully!" });
    } catch (error) {
      console.error("❌ Upload Carousel Error:", error);
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(path.join(__dirname, "../public/uploads/carousel", file.filename));
          } catch (deleteError) {
            console.error("❌ File Delete Error:", deleteError);
          }
        }
      }
      res.status(500).json({ error: "Server error. Please try again." });
    }
  });
};


exports.getCarouselImages = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res.status(200).json({ slides: [] });
    }
    res.status(200).json({ slides: carousel.slides });
  } catch (error) {
    console.error("❌ Get Carousel Images Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.renderCoursel = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    res.render("admin/coursel", {
      carouselImages: carousel ? carousel.slides : [],
    });
  } catch (error) {
    console.error("❌ Render Carousel Error:", error);
    res.status(500).send("Server error");
  }
};

exports.renderContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Contacts per page
    const skip = (page - 1) * limit;

    const totalContacts = await Contact.countDocuments();
    const contacts = await Contact.find()
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(200).json({
        contacts,
        currentPage: page,
        totalPages: Math.ceil(totalContacts / limit),
      });
    } else {
      res.render("admin/contact-list", {
        user: req.user,
        contacts: [], // Empty initially, populated via AJAX
        currentPage: 1,
        totalPages: 1,
      });
    }
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).send("Server error");
    }
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { contactId, page } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: "Invalid contact ID." });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found." });
    }

    await Contact.findByIdAndDelete(contactId);

    // Fetch updated contact list
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalContacts = await Contact.countDocuments();
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    
    res.status(200).json({
      message: "Contact deleted successfully!",
      contacts,
      currentPage: page,
      totalPages: Math.ceil(totalContacts / limit),
    });
  } catch (error) {
    console.error("❌ Contact Deletion Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.renderPayment = async (req, res) => {
  try {
    res.render("admin/payment");
  } catch (error) {
    console.error("❌ Payment Render Error:", error);
    res.status(500).send("Server error");
  }
};

// Get all payments with pagination
exports.getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalPayments = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('order', 'orderId billingInfo.firstName totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      payments: payments.map(payment => ({
        _id: payment._id,
        orderId: payment.order.orderId,
        customerName: payment.order.billingInfo.firstName,
        amount: payment.order.totalAmount,
        received: payment.status === 'Received'
      })),
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit)
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Server error while fetching payments' });
  }
};

// Update payment status
exports.toggleReceived = async (req, res) => {
  try {
    const { paymentId, received, page } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = received ? 'Received' : 'Pending';
    payment.updatedAt = Date.now();
    await payment.save();

    const limit = 10;
    const skip = (page - 1) * limit;
    const totalPayments = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('order', 'orderId billingInfo.firstName totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      message: `Payment status updated to ${received ? 'Received' : 'Pending'}`,
      payments: payments.map(payment => ({
        _id: payment._id,
        orderId: payment.order.orderId,
        customerName: payment.order.billingInfo.firstName,
        amount: payment.order.totalAmount,
        received: payment.status === 'Received'
      })),
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit)
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Server error while updating payment status' });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId, page } = req.body;

    const payment = await Payment.findByIdAndDelete(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const limit = 10;
    const skip = (page - 1) * limit;
    const totalPayments = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('order', 'orderId billingInfo.firstName totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      message: 'Payment deleted successfully',
      payments: payments.map(payment => ({
        _id: payment._id,
        orderId: payment.order.orderId,
        customerName: payment.order.billingInfo.firstName,
        amount: payment.order.totalAmount,
        received: payment.status === 'Received'
      })),
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit)
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Server error while deleting payment' });
  }
};




exports.renderTrackId = async(req, res) =>{
    try {
        res.render("admin/trackId");
    } catch (error) {
        console.error("❌ Track ID Error:", error);
        res.status(500).send("Server error");
    }
}

exports.renderAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || '';

    let query = {};
    if (filter) {
      query.status = filter;
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product')
      .populate('user', 'email');

    // Updated to include orderId instead of just _id
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId, // Use the custom orderId
      customerName: order.billingInfo.firstName,
      totalPrice: order.totalAmount,
      trackingId: order.trackingId || '',
      status: order.status
    }));

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(200).json({
        orders: formattedOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
      });
    } else {
      res.render("admin/orders", {
        user: req.user,
        orders: [],
        currentPage: 1,
        totalPages: 1,
      });
    }
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).send("Server error");
    }
  }
};

// Keep the assignTrackingId using orderId as well

exports.assignTrackingId = async (req, res) => {
  try {
    const { orderId, trackingId } = req.body;

    if (!orderId || !trackingId) {
      return res.status(400).json({
        error: "Order ID and Tracking ID are required"
      });
    }

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // Check if order already has a tracking ID or is already shipped
    if (order.trackingId && order.status === "Shipped") {
      return res.status(400).json({
        error: `Order ${order.orderId} already has tracking ID ${order.trackingId}. Cannot reassign tracking ID.`
      });
    }

    // Update order details
    order.trackingId = trackingId;
    order.status = "Shipped";
    order.updatedAt = new Date();

    await order.save();

    // Prepare and send email notification
    const trackingUrl = `https://www.tcsexpress.com/?trackingnumber=${trackingId}`;
    const emailSubject = `Your Order ${order.orderId} Has Been Shipped`;
    const emailHtml = `
      <h2>Order Shipment Notification</h2>
      <p>Dear ${order.billingInfo.firstName},</p>
      <p>Your order <strong>${order.orderId}</strong> has been shipped!</p>
      <p><strong>Tracking ID:</strong> ${trackingId}</p>
      <p>You can track your order using the following link:</p>
      <p><a href="${trackingUrl}" target="_blank">Track Your Order on TCS Express</a></p>
      <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br>Your Company Name</p>
    `;

    try {
      await sendEmail(
        order.billingInfo.emailAddress,
        emailSubject,
        emailHtml
      );
    } catch (emailError) {
      console.error("Email sending failed, but order was updated:", emailError);
    }

    res.status(200).json({
      message: "Tracking ID assigned successfully and notification email sent",
      order: {
        orderId: order.orderId,
        customerName: order.billingInfo.firstName,
        totalPrice: order.totalAmount,
        trackingId: order.trackingId,
        status: order.status
      }
    });
  } catch (error) {
    console.error("❌ Error assigning tracking ID:", error);
    res.status(500).json({
      error: "Server error while assigning tracking ID"
    });
  }
};


// Get Order Details (New)
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate('items.product', 'name price image') // Populate product details including image
      .populate('user', 'email');

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    // Format the response to include necessary details
    const formattedOrder = {
      orderId: order.orderId,
      customerName: order.billingInfo.firstName,
      totalPrice: order.totalAmount,
      trackingId: order.trackingId || 'Not Assigned',
      status: order.status,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price, // Price from order item, not product (in case of discounts)
        image: item.product.image // Assuming image is a URL stored in the product
      })),
      billingInfo: {
        streetAddress: order.billingInfo.streetAddress,
        townCity: order.billingInfo.townCity,
        phoneNumber: order.billingInfo.phoneNumber,
        emailAddress: order.billingInfo.emailAddress
      },
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error("❌ Error fetching order details:", error);
    res.status(500).json({ error: "Server error fetching order details" });
  }
};

// Delete Order (New)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOneAndDelete({ orderId });
    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    res.status(200).json({
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({
      error: "Server error deleting order"
    });
  }
};
// ... (renderAdminOrders remains unchanged)

exports.renderAdminCancelledOrders = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // Orders per page
      const skip = (page - 1) * limit;

      const totalOrders = await CancelledOrder.countDocuments();
      const cancelledOrders = await CancelledOrder.find()
          .sort({ cancelledAt: -1 }) // Newest first
          .skip(skip)
          .limit(limit)
          .populate("items.product")
          .populate("user", "email");

      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
          res.status(200).json({
              cancelledOrders,
              currentPage: page,
              totalPages: Math.ceil(totalOrders / limit),
          });
      } else {
          res.render("orders/order-history", {
              user: req.user,
              cancelledOrders: [], // Empty initially, populated via AJAX
              currentPage: 1,
              totalPages: 1,
          });
      }
  } catch (error) {
      console.error("❌ Error fetching cancelled orders:", error);
      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
          res.status(500).json({ error: "Server error" });
      } else {
          res.status(500).send("Server error");
      }
  }
};


exports.deleteCancelledOrder = async (req, res) => {
  try {
      const { orderId, page } = req.body;

      if (!orderId) {
          return res.status(400).json({ error: "Invalid order ID." });
      }

      const cancelledOrder = await CancelledOrder.findOne({ orderId });
      if (!cancelledOrder) {
          return res.status(404).json({ error: "Cancelled order not found." });
      }

      await CancelledOrder.deleteOne({ orderId });

      // Fetch updated cancelled order list
      const limit = 10;
      const skip = (page - 1) * limit;
      const totalOrders = await CancelledOrder.countDocuments();
      const cancelledOrders = await CancelledOrder.find()
          .sort({ cancelledAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("items.product")
          .populate("user", "email");

      res.status(200).json({
          message: "Cancelled order deleted successfully!",
          cancelledOrders,
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
      });
  } catch (error) {
      console.error("❌ Cancelled Order Deletion Error:", error);
      res.status(500).json({ error: "Server error. Please try again." });
  }
};



exports.renderAnalytics = async (req, res) => {
  console.log('Entering renderAnalytics'); // Confirm entry
  try {
    console.log('Fetching orders');
    const orders = await Order.find();
    console.log('Orders fetched:', orders.length);

    console.log('Calculating total revenue');
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    console.log('Total revenue:', totalRevenue);

    const totalOrders = orders.length;
    console.log('Total orders:', totalOrders);

    console.log('Counting new customers');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    console.log('New customers:', newCustomers);

    console.log('Calculating products sold');
    const productsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);
    console.log('Products sold:', productsSold);

    console.log('Running order analytics aggregation');
    const orderAnalytics = await Order.aggregate([
      { $match: { createdAt: { $exists: true, $type: "date" } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          incoming: { $sum: 1 },
          outgoing: { $sum: { $cond: [{ $eq: ["$status", "Shipped"] }, 1, 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    console.log('Order analytics:', orderAnalytics);

    console.log('Running revenue analytics aggregation');
    const revenueAnalytics = await Order.aggregate([
      { $match: { createdAt: { $exists: true, $type: "date" } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    console.log('Revenue analytics:', revenueAnalytics);

    console.log('Running category analytics aggregation');
    const categoryAnalytics = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          count: { $sum: "$items.quantity" }
        }
      },
      { $sort: { "count": -1 } }
    ]);
    console.log('Category analytics:', categoryAnalytics);

    console.log('Running growth analytics aggregation');
    const growthAnalytics = await User.aggregate([
      { $match: { createdAt: { $exists: true, $type: "date" } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    console.log('Growth analytics:', growthAnalytics);

    console.log('Rendering analytics page');
    res.render("admin/analytics", {
      totalRevenue,
      totalOrders,
      newCustomers,
      productsSold,
      orderAnalytics,
      revenueAnalytics,
      categoryAnalytics,
      growthAnalytics
    });
  } catch (error) {
    console.error('❌ Analytics Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).render("admin/analytics", { error: `Server error while fetching analytics: ${error.message}` });
  }
};

exports.renderManageUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || "all";

    let query = {};
    if (filter !== "all") {
      query.role = filter;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query, "name email role lastActive")
      .sort({ lastActive: -1, createdAt: -1 }) // Sort by lastActive descending, then createdAt
      .skip(skip)
      .limit(limit)
      .lean();

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(200).json({
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      });
    } else {
      res.render("admin/manage-users", {
        user: req.user,
        users: [],
        currentPage: 1,
        totalPages: 1,
        successMessage: req.query.successMessage || null,
        errorMessage: req.query.errorMessage || null,
      });
    }
  } catch (error) {
    console.error("❌ Manage Users Page Error:", error);
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).send("Server error");
    }
  }
};
  
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const page = req.query.page || 1;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role selection." });
    }

    // Check if req.user is set by authenticateUser
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User not authenticated. Please log in." });
    }

    if (req.user.userId.toString() === userId) {
      return res.status(403).json({ error: "You cannot change your own role." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.role = role;
    await user.save();

    // Fetch updated user list for the current page
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const users = await User.find({}, "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: `Role updated successfully for ${user.email}`,
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error("❌ Update User Role Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

exports.renderUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching User ID:", userId);

    if (!userId || userId.length !== 24) {
      console.error("❌ Invalid User ID Format:", userId);
      return res.status(400).render("admin/user-details", { error: "Invalid User ID", user: null });
    }

    const user = await User.findById(userId);
    console.log("Found User:", user);

    if (!user) {
      console.error("❌ User Not Found for ID:", userId);
      return res.status(404).render("admin/user-details", { error: "User not found", user: null });
    }

    // Fetch cart details
    const cart = await Cart.findOne({ user: userId });
    const cartCount = cart ? cart.items.length : 0;
    const cartTotalPrice = cart ? cart.totalPrice : 0;

    // Fetch wishlist details
    const wishlist = await Wishlist.findOne({ user: userId });
    const wishlistCount = wishlist ? wishlist.items.length : 0;

    // Fetch orders
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.render("admin/user-details", {
      user: {
        ...user._doc,
        cartCount,
        cartTotalPrice,
        wishlistCount,
        billingInfo: user.billingInfo || {}, // Include billing info
        orders // Include orders
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ User Details Error:", error);
    res.status(500).render("admin/user-details", { error: "Server error", user: null });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.email !== req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use." });
      }
    }

    user.name = req.body.name;
    user.email = req.body.email;
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: { userId: user._id, name: user.name, email: user.email, role: user.role }, // Return full user data
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    return res.status(500).json({ error: "Server error. Try again." });
  }
};
  
exports.changePassword = async (req, res) => {
try {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "New passwords do not match." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({ message: "Password changed successfully!" });
} catch (error) {
  console.error("❌ Password Change Error:", error);
  return res.status(500).json({ error: "Server error. Try again." });
}
};

exports.updateContact = async (req, res) => {
  try {
      const { phoneNumber, customerEmail, supportEmail, aboutUs, city } = req.body;
      
      let contactInfo = await ContactInfo.findOne();
      if (contactInfo) {
          contactInfo.phoneNumber = phoneNumber;
          contactInfo.customerEmail = customerEmail;
          contactInfo.supportEmail = supportEmail;
          contactInfo.aboutUs = aboutUs;
          contactInfo.city = city;
          await contactInfo.save();
      } else {
          contactInfo = await ContactInfo.create({
              phoneNumber,
              customerEmail,
              supportEmail,
              aboutUs,
              city
          });
      }

      res.status(200).json({
          message: 'Contact info updated successfully',
          contactInfo: {
              phoneNumber: contactInfo.phoneNumber,
              customerEmail: contactInfo.customerEmail,
              supportEmail: contactInfo.supportEmail,
              aboutUs: contactInfo.aboutUs,
              city: contactInfo.city
          }
      });
  } catch (error) {
      console.error('❌ Update Contact Error:', error);
      res.status(500).json({ error: 'Server error while updating contact info' });
  }
};
// Render Settings Page
exports.renderSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const contactInfo = await ContactInfo.findOne({}).lean(); // Fetch contact details

    // Fetch shipping and tax settings from ShippingSettings (or use defaults if none exist)
    let shippingSettings = await ShippingSettings.findOne().lean() || {
      shippingOption: 'free', // Default to free shipping
      shippingRate: 0,       // Default shipping rate
      taxRate: 0,           // Default tax rate
    };

    // Render the settings page with user, contact, and shipping/tax data
    res.render("admin/setting", {
      user: user || {},
      contactInfo: contactInfo || {}, // Pass empty object if no contact exists
      shippingSettings: shippingSettings, // Pass shipping and tax settings
      error: null,
      passwordError: null,
      passwordSuccess: null,
      successMessage: null
    });
  } catch (error) {
    console.error("❌ Render Settings Error:", error);
    res.status(500).send("Server error");
  }
};
// Update Shipping and Tax Settings
exports.updateShippingTax = async (req, res) => {
  try {
      const { shippingOption, shippingRate, taxRate } = req.body;

      // Validate input
      if (!shippingOption || (shippingOption !== 'free' && shippingOption !== 'rate')) {
          return res.status(400).json({ error: 'Invalid shipping option' });
      }
      if (typeof shippingRate !== 'number' || shippingRate < 0) {
          return res.status(400).json({ error: 'Invalid shipping rate' });
      }
      if (typeof taxRate !== 'number' || taxRate < 0) {
          return res.status(400).json({ error: 'Invalid tax rate' });
      }

      // Find existing settings or create new
      let shippingSettings = await ShippingSettings.findOne();
      
      if (shippingSettings) {
          // Update existing settings
          shippingSettings.shippingOption = shippingOption;
          shippingSettings.shippingRate = shippingOption === 'rate' ? shippingRate : 0;
          shippingSettings.taxRate = taxRate;
          await shippingSettings.save();
      } else {
          // Create new settings
          shippingSettings = await ShippingSettings.create({
              shippingOption,
              shippingRate: shippingOption === 'rate' ? shippingRate : 0,
              taxRate
          });
      }

      res.status(200).json({
          message: 'Shipping and tax settings updated successfully',
          shippingSettings: {
              shippingOption: shippingSettings.shippingOption,
              shippingRate: shippingSettings.shippingRate,
              taxRate: shippingSettings.taxRate
          }
      });
  } catch (error) {
      console.error('❌ Update Shipping/Tax Error:', error);
      res.status(500).json({ error: 'Server error while updating settings' });
  }
};

exports.getShippingSettings = async (req, res) => {
  try {
    const settings = await ShippingSettings.findOne() || {
      shippingOption: 'free',
      shippingRate: 0,
      taxRate: 0
    };
    console.log("Settings from getShippingSettings:", settings);
    res.json(settings);
  } catch (error) {
    console.error('❌ Get Shipping Settings Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Reply to contact
exports.replyToContact = async (req, res) => {
  try {
    const { contactId, replyMessage, email } = req.body;

    // Validate input
    if (!contactId || !replyMessage || !email) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID, reply message, and email are required'
      });
    }

    // Find the contact in the database
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Prepare email content
    const subject = `Response to Your Contact Request`;
    const html = `
      <h2>Hello ${contact.name},</h2>
      <p>We have received your message:</p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
        ${contact.message}
      </blockquote>
      <p>Our response:</p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
        ${replyMessage}
      </div>
      <p>Best regards,<br>The Admin Team</p>
    `;

    // Send email using the utility function
    await sendEmail(email, subject, html);

    // Update contact status in database
    contact.replyStatus = 'replied';
    contact.replyMessage = replyMessage;
    contact.replyDate = new Date();
    await contact.save();

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    console.error('Error in replyToContact:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reply',
      error: error.message
    });
  }
};