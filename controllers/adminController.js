const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Contact = require("../models/Contact");
const ShippingSettings = require('../models/Shipping');
const sendEmail = require('../utils/emailConfig');
const ContactInfo = require("../models/info");
const CancelledOrder = require("../models/CancelledOrder");
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const bcrypt = require("bcryptjs");
const Carousel = require("../models/Carousel");
const { uploadCarousel } = require("../config/multer-config");
const fs = require("fs").promises;
const path = require("path");
const { generateContactReplyEmail, generateShipmentEmail } = require('../utils/emailTemplates'); // Import new template

// Upload carousel images
exports.uploadCarouselImages = async (req, res) => {
    uploadCarousel(req, res, async (err) => {
        try {
            // Handle multer errors
            if (err) return res.status(400).json({ error: err.message });

            // Validate that at least one file is uploaded
            if (!req.files || req.files.length < 1) {
                return res.status(400).json({ error: "Please upload at least 1 image." });
            }

            // Fetch existing carousel to manage old slides
            const existingCarousel = await Carousel.findOne();
            let existingSlides = existingCarousel ? existingCarousel.slides : [];

            // Create new slide objects from uploaded files
            const newSlides = req.files.map((file) => ({
                image: `/uploads/carousel/${file.filename}`
            }));

            // Update or create carousel with new slides
            await Carousel.findOneAndUpdate(
                {},
                { slides: newSlides, updatedAt: Date.now() },
                { upsert: true, new: true }
            );

            // Clean up old images from disk if replaced
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
            // Clean up uploaded files on error
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

// Fetch carousel images for display
exports.getCarouselImages = async (req, res) => {
    try {
        const carousel = await Carousel.findOne();
        // Return empty array if no carousel exists
        res.status(200).json({ slides: carousel ? carousel.slides : [] });
    } catch (error) {
        console.error("❌ Get Carousel Images Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Render carousel admin page
exports.renderCoursel = async (req, res) => {
    try {
        const carousel = await Carousel.findOne();
        res.render("admin/coursel", {
            carouselImages: carousel ? carousel.slides : []
        });
    } catch (error) {
        console.error("❌ Render Carousel Error:", error);
        res.status(500).send("Server error");
    }
};

// Render contacts list with pagination
exports.renderContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Count total contacts and fetch paginated list
        const totalContacts = await Contact.countDocuments();
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Handle AJAX request
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
            res.status(200).json({
                contacts,
                currentPage: page,
                totalPages: Math.ceil(totalContacts / limit),
            });
        } else {
            // Initial render with empty list (populated via AJAX)
            res.render("admin/contact-list", {
                user: req.user,
                contacts: [],
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

// Delete a contact entry
exports.deleteContact = async (req, res) => {
    try {
        const { contactId, page } = req.body;

        // Validate contact ID
        if (!contactId) return res.status(400).json({ error: "Invalid contact ID." });

        const contact = await Contact.findById(contactId);
        if (!contact) return res.status(404).json({ error: "Contact not found." });

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

// Render payment admin page
exports.renderPayment = async (req, res) => {
    try {
        res.render("admin/payment");
    } catch (error) {
        console.error("❌ Payment Render Error:", error);
        res.status(500).send("Server error");
    }
};

// Fetch payments with pagination
exports.getPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Fetch valid payments with order details
        const totalPayments = await Payment.countDocuments({ order: { $exists: true, $ne: null } });
        const payments = await Payment.find({ order: { $exists: true, $ne: null } })
            .populate({
                path: 'order',
                select: 'orderId billingInfo.firstName totalAmount',
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const validPayments = payments.filter(payment => payment.order && payment.order.orderId);

        // Adjust page if no valid payments on current page
        if (validPayments.length === 0 && totalPayments > 0 && page > 1) {
            const lastPage = Math.ceil(totalPayments / limit);
            return res.json({
                payments: [],
                currentPage: lastPage,
                totalPages: lastPage,
                redirect: true
            });
        }

        // Format payment data for response
        const paymentData = validPayments.map(payment => ({
            _id: payment._id,
            orderId: payment.order.orderId,
            customerName: payment.order.billingInfo?.firstName || 'Unknown',
            amount: payment.order.totalAmount || 0,
            received: payment.status === 'Received'
        }));

        res.json({
            payments: paymentData,
            currentPage: page,
            totalPages: Math.ceil(totalPayments / limit)
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Server error while fetching payments' });
    }
};

// Toggle payment received status
exports.toggleReceived = async (req, res) => {
    try {
        const { paymentId, received, page } = req.body;

        const payment = await Payment.findById(paymentId).populate('order');
        if (!payment || !payment.order) {
            return res.status(404).json({ error: 'Payment or associated order not found' });
        }

        // Update payment status
        payment.status = received ? 'Received' : 'Pending';
        payment.updatedAt = Date.now();
        await payment.save();

        // Fetch updated payment list
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalPayments = await Payment.countDocuments({ order: { $exists: true, $ne: null } });
        const payments = await Payment.find({ order: { $exists: true, $ne: null } })
            .populate({
                path: 'order',
                select: 'orderId billingInfo.firstName totalAmount',
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const validPayments = payments.filter(payment => payment.order && payment.order.orderId);

        const paymentData = validPayments.map(payment => ({
            _id: payment._id,
            orderId: payment.order.orderId,
            customerName: payment.order.billingInfo?.firstName || 'Unknown',
            amount: payment.order.totalAmount || 0,
            received: payment.status === 'Received'
        }));

        res.json({
            message: `Payment status updated to ${received ? 'Received' : 'Pending'}`,
            payments: paymentData,
            currentPage: page,
            totalPages: Math.ceil(totalPayments / limit)
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Server error while updating payment status' });
    }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
    try {
        const { paymentId, page } = req.body;

        const payment = await Payment.findById(paymentId).populate('order');
        if (!payment || !payment.order) {
            return res.status(404).json({ error: 'Payment or associated order not found' });
        }

        await Payment.findByIdAndDelete(paymentId);

        // Fetch updated payment list with page adjustment
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalPayments = await Payment.countDocuments({ order: { $exists: true, $ne: null } });
        const payments = await Payment.find({ order: { $exists: true, $ne: null } })
            .populate({
                path: 'order',
                select: 'orderId billingInfo.firstName totalAmount',
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const validPayments = payments.filter(payment => payment.order && payment.order.orderId);
        const totalPages = Math.ceil(totalPayments / limit);
        const adjustedPage = page > totalPages ? totalPages : page;

        const paymentData = validPayments.map(payment => ({
            _id: payment._id,
            orderId: payment.order.orderId,
            customerName: payment.order.billingInfo?.firstName || 'Unknown',
            amount: payment.order.totalAmount || 0,
            received: payment.status === 'Received'
        }));

        res.json({
            message: 'Payment deleted successfully',
            payments: paymentData,
            currentPage: adjustedPage,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Server error while deleting payment' });
    }
};

// Render track ID admin page
exports.renderTrackId = async (req, res) => {
    try {
        res.render("admin/trackId");
    } catch (error) {
        console.error("❌ Track ID Error:", error);
        res.status(500).send("Server error");
    }
};

// Render admin orders with pagination
exports.renderAdminOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || '';

        let query = filter ? { status: filter } : {};

        // Fetch orders with pagination and populate related data
        const totalOrders = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('items.product')
            .populate('user', 'email');

        const formattedOrders = orders.map(order => ({
            orderId: order.orderId,
            customerName: order.billingInfo.firstName,
            totalPrice: order.totalAmount,
            trackingId: order.trackingId || '',
            status: order.status
        }));

        // Handle AJAX request
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


// Assign tracking ID to an order and notify the customer
exports.assignTrackingId = async (req, res) => {
    try {
        const { orderId, trackingId } = req.body;

        // Validate required input fields
        if (!orderId || !trackingId) {
            return res.status(400).json({ error: "Order ID and Tracking ID are required" });
        }

        // Fetch the order by its custom orderId
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Prevent reassignment if the order is already shipped
        if (order.trackingId && order.status === "Shipped") {
            return res.status(400).json({
                error: `Order ${order.orderId} already has tracking ID ${order.trackingId}. Cannot reassign tracking ID.`
            });
        }

        // Update order with tracking details
        order.trackingId = trackingId;
        order.status = "Shipped";
        order.updatedAt = new Date();
        await order.save();

        // Prepare data for the shipment email template
        const trackingUrl = `https://www.tcsexpress.com/?trackingnumber=${trackingId}`;
        const emailHtml = generateShipmentEmail({
            name: order.billingInfo.firstName,
            orderId: order.orderId,
            totalAmount: order.totalAmount,
            trackingId: trackingId,
            trackingUrl: trackingUrl // Optional, defaults to TCS Express URL if not provided
        });

        // Send shipment notification email to the customer
        try {
            await sendEmail(
                order.billingInfo.emailAddress,
                `Your Order ${order.orderId} Has Been Shipped`,
                emailHtml
            );
        } catch (emailError) {
            // Log email failure but don't fail the request since order update succeeded
            console.error("Email sending failed, but order was updated:", emailError);
        }

        // Respond with success message and updated order details
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
        // Log and handle any errors during the process
        console.error("❌ Error assigning tracking ID:", error);
        res.status(500).json({ error: "Server error while assigning tracking ID" });
    }
};

// Fetch order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ orderId })
            .populate('items.product', 'name price image')
            .populate('user', 'email');

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Format order details for response
        const formattedOrder = {
            orderId: order.orderId,
            customerName: order.billingInfo.firstName,
            totalPrice: order.totalAmount,
            trackingId: order.trackingId || 'Not Assigned',
            status: order.status,
            items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.image
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

// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOneAndDelete({ orderId });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting order:", error);
        res.status(500).json({ error: "Server error deleting order" });
    }
};

// Render cancelled orders with pagination
exports.renderAdminCancelledOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Fetch cancelled orders with pagination
        const totalOrders = await CancelledOrder.countDocuments();
        const cancelledOrders = await CancelledOrder.find()
            .sort({ cancelledAt: -1 })
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
                cancelledOrders: [],
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

// Delete a cancelled order
exports.deleteCancelledOrder = async (req, res) => {
    try {
        const { orderId, page } = req.body;

        if (!orderId) return res.status(400).json({ error: "Invalid order ID." });

        const cancelledOrder = await CancelledOrder.findOne({ orderId });
        if (!cancelledOrder) return res.status(404).json({ error: "Cancelled order not found." });

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

// Render analytics dashboard
exports.renderAnalytics = async (req, res) => {
    try {
        const orders = await Order.find();

        // Calculate basic metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newCustomers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const productsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);

        // Aggregate order analytics by month
        const orderAnalytics = await Order.aggregate([
            { $match: { createdAt: { $exists: true, $type: "date" } } },
            { $group: { _id: { $month: "$createdAt" }, incoming: { $sum: 1 }, outgoing: { $sum: { $cond: [{ $eq: ["$status", "Shipped"] }, 1, 0] } } } },
            { $sort: { "_id": 1 } }
        ]);

        // Aggregate revenue by month
        const revenueAnalytics = await Order.aggregate([
            { $match: { createdAt: { $exists: true, $type: "date" } } },
            { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$totalAmount" } } },
            { $sort: { "_id": 1 } }
        ]);

        // Aggregate sales by category
        const categoryAnalytics = await Order.aggregate([
            { $unwind: "$items" },
            { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productInfo" } },
            { $unwind: "$productInfo" },
            { $group: { _id: "$productInfo.category", count: { $sum: "$items.quantity" } } },
            { $sort: { "count": -1 } }
        ]);

        // Aggregate user growth by month
        const growthAnalytics = await User.aggregate([
            { $match: { createdAt: { $exists: true, $type: "date" } } },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        // Render analytics page with calculated data
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
        console.error('❌ Analytics Error:', error);
        res.status(500).render("admin/analytics", { error: `Server error while fetching analytics: ${error.message}` });
    }
};

// Render manage users page with pagination
exports.renderManageUsers = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || "all";

        let query = filter !== "all" ? { role: filter } : {};

        // Fetch users with pagination
        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query, "name email role lastActive")
            .sort({ lastActive: -1, createdAt: -1 })
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

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const page = req.query.page || 1;

        // Validate role input
        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role selection." });
        }

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: "User not authenticated. Please log in." });
        }

        // Prevent self-role change
        if (req.user.userId.toString() === userId) {
            return res.status(403).json({ error: "You cannot change your own role." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        user.role = role;
        await user.save();

        // Fetch updated user list
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

// Render user details page
exports.renderUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId || userId.length !== 24) {
            return res.status(400).render("admin/user-details", { error: "Invalid User ID", user: null });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).render("admin/user-details", { error: "User not found", user: null });
        }

        // Fetch additional user data
        const cart = await Cart.findOne({ user: userId });
        const wishlist = await Wishlist.findOne({ user: userId });
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        res.render("admin/user-details", {
            user: {
                ...user._doc,
                cartCount: cart ? cart.items.length : 0,
                cartTotalPrice: cart ? cart.totalPrice : 0,
                wishlistCount: wishlist ? wishlist.items.length : 0,
                billingInfo: user.billingInfo || {},
                orders
            },
            error: null,
        });
    } catch (error) {
        console.error("❌ User Details Error:", error);
        res.status(500).render("admin/user-details", { error: "Server error", user: null });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        // Check for email uniqueness
        if (user.email !== req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) return res.status(400).json({ error: "Email already in use." });
        }

        user.name = req.body.name;
        user.email = req.body.email;
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully!",
            user: { userId: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("❌ Profile Update Error:", error);
        res.status(500).json({ error: "Server error. Try again." });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ error: "User not found." });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Current password is incorrect." });

        if (newPassword !== confirmPassword) return res.status(400).json({ error: "New passwords do not match." });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {
        console.error("❌ Password Change Error:", error);
        res.status(500).json({ error: "Server error. Try again." });
    }
};

// Update contact information
exports.updateContact = async (req, res) => {
    try {
        const { phoneNumber, customerEmail, supportEmail, aboutUs, city } = req.body;

        let contactInfo = await ContactInfo.findOne();
        if (contactInfo) {
            // Update existing contact info
            contactInfo.phoneNumber = phoneNumber;
            contactInfo.customerEmail = customerEmail;
            contactInfo.supportEmail = supportEmail;
            contactInfo.aboutUs = aboutUs;
            contactInfo.city = city;
            await contactInfo.save();
        } else {
            // Create new contact info
            contactInfo = await ContactInfo.create({ phoneNumber, customerEmail, supportEmail, aboutUs, city });
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

// Render settings page
exports.renderSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const contactInfo = await ContactInfo.findOne({}).lean();
        const shippingSettings = await ShippingSettings.findOne().lean() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0,
        };

        res.render("admin/setting", {
            user: user || {},
            contactInfo: contactInfo || {},
            shippingSettings,
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

// Update shipping and tax settings
exports.updateShippingTax = async (req, res) => {
    try {
        const { shippingOption, shippingRate, taxRate } = req.body;

        // Validate input data
        if (!shippingOption || (shippingOption !== 'free' && shippingOption !== 'rate')) {
            return res.status(400).json({ error: 'Invalid shipping option' });
        }
        if (typeof shippingRate !== 'number' || shippingRate < 0) {
            return res.status(400).json({ error: 'Invalid shipping rate' });
        }
        if (typeof taxRate !== 'number' || taxRate < 0) {
            return res.status(400).json({ error: 'Invalid tax rate' });
        }

        let shippingSettings = await ShippingSettings.findOne();
        if (shippingSettings) {
            shippingSettings.shippingOption = shippingOption;
            shippingSettings.shippingRate = shippingOption === 'rate' ? shippingRate : 0;
            shippingSettings.taxRate = taxRate;
            await shippingSettings.save();
        } else {
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

// Fetch shipping settings
exports.getShippingSettings = async (req, res) => {
    try {
        const settings = await ShippingSettings.findOne() || {
            shippingOption: 'free',
            shippingRate: 0,
            taxRate: 0
        };
        res.json(settings);
    } catch (error) {
        console.error('❌ Get Shipping Settings Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reply to a contact message
exports.replyToContact = async (req, res) => {
    try {
        const { contactId, replyMessage, email } = req.body;

        // Validate required fields
        if (!contactId || !replyMessage || !email) {
            return res.status(400).json({
                success: false,
                message: 'Contact ID, reply message, and email are required'
            });
        }

        // Fetch contact details
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Generate email content using template
        const html = generateContactReplyEmail({
            name: contact.name,
            originalMessage: contact.message,
            replyMessage
        });

        // Send reply email
        await sendEmail(email, 'Response to Your Contact Request', html);

        // Update contact status
        contact.replyStatus = 'replied';
        contact.replyMessage = replyMessage;
        contact.replyDate = new Date();
        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Reply sent successfully'
        });
    } catch (error) {
        console.error('Error in replyToContact:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send reply',
            error: error.message
        });
    }
};