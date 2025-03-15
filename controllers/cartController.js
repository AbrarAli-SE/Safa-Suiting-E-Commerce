// controllers/cartController.js
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ShippingSettings = require('../models/Shipping');
const Payment = require('../models/Payment');

const Order = require("../models/Order");
const sendEmail = require("../utils/emailConfig"); // Import your email utility


// Generate a random 6-digit order ID
function generateOrderId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `ORD-${randomNum}`;
}

exports.addToCart = async (req, res) => {
    const { productId } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Please log in to add items to your cart." });

    try {
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });

        let cart = await Cart.findOne({ user: req.user.userId }) || new Cart({
            user: req.user.userId,
            items: [],
            totalPrice: 0,
            finalTotal: 0
        });

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

        await updateCartTotals(cart);
        await cart.save();
        return res.json({ success: true, message: "Product added to cart successfully!", cart });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

exports.renderCart = async (req, res) => {
    if (!req.user?.userId) return res.status(401).render("auth/login", { error: "Please log in to view your cart." });

    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };

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

        const subtotal = cart.totalPrice;
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const totalAmount = subtotal + shipping + tax;

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


exports.updateCart = async (req, res) => {
    const { updatedItems } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Please log in to update your cart." });
  
    try {
      // Update user's lastActive
      const user = await User.findById(req.user.userId);
      if (user) {
        user.lastActive = new Date();
        await user.save();
      }
  
      const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
      if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });
  
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
  
      cart.items = updatedCartItems.map(item => ({
        product: item.product,
        name: item.name,
        img: item.img,
        price: item.price,
        quantity: item.quantity
      }));
  
      await updateCartTotals(cart);
      await cart.save();
  
      const cartResponse = cart.toObject();
      cartResponse.items = updatedCartItems; // Include availableQuantity in success response too
  
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


exports.deleteItem = async (req, res) => {
    const { itemId } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Please log in to remove items from your cart." });

    try {
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        const cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await updateCartTotals(cart);
        await cart.save();
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

// Helper function to update cart totals
async function updateCartTotals(cart) {
    const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
    cart.tax = cart.totalPrice * (shippingSettings.taxRate / 100);
    cart.finalTotal = cart.totalPrice + cart.shipping + cart.tax;
}



exports.checkoutCart = async (req, res) => {
    if (!req.user?.userId) return res.status(401).render("auth/login", { error: "Please log in to checkout." });

    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
        const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };
        const user = await User.findById(req.user.userId);

        if (!cart?.items?.length) {
            return res.redirect("/user/cart");
        }

        const subtotal = cart.totalPrice;
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const tax = subtotal * (shippingSettings.taxRate / 100);
        const totalAmount = subtotal + shipping + tax;

        res.render("cart/checkout", {
            user: req.user,
            cart: cart.items,
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingSettings,
            billingInfo: user.billingInfo || {}, // Pass saved billing info
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Checkout Page Error:", error.message);
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










exports.processCheckout = async (req, res) => {
  try {
    const { firstName, streetAddress, apartment, townCity, phoneNumber, emailAddress, saveInfo } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
    const shippingSettings = await ShippingSettings.findOne() || { shippingOption: 'free', shippingRate: 0, taxRate: 0 };

    if (!cart?.items?.length) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity
    }));

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      if (product.quantity < item.quantity) throw new Error(`Insufficient quantity for ${product.name}. Available: ${product.quantity}`);
    }

    const subtotal = cart.totalPrice;
    const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
    const tax = subtotal * (shippingSettings.taxRate / 100);
    const totalAmount = subtotal + shipping + tax;

    let orderId = generateOrderId();
    let existingOrder = await Order.findOne({ orderId });
    while (existingOrder) {
      orderId = generateOrderId();
      existingOrder = await Order.findOne({ orderId });
    }

    const order = new Order({
      user: req.user.userId,
      orderId,
      items,
      billingInfo: { firstName, streetAddress, apartment, townCity, phoneNumber, emailAddress },
      paymentMethod: 'cash', // Assuming 'cash' means COD here
      subtotal,
      shipping,
      tax,
      totalAmount,
      status: 'pending'
    });

    await order.save();

    // Create Payment document
    const payment = new Payment({
      order: order._id,
      status: order.paymentMethod === 'cash' ? 'Pending' : 'Received' // COD = Pending, others = Received
    });
    await payment.save();

    // Update product quantities
    for (const item of items) {
      const product = await Product.findById(item.product);
      product.quantity -= item.quantity;
      await product.save();
    }

    // Save billing info if requested
    if (saveInfo) {
      const user = await User.findById(req.user.userId);
      user.billingInfo = { firstName, streetAddress, apartment, townCity, phoneNumber, emailAddress };
      await user.save();
    }

    await Cart.deleteOne({ user: req.user.userId });

    const emailHtml = generateOrderEmail(order);
    await sendEmail(order.billingInfo.emailAddress, `Order Confirmation - ${order.orderId}`, emailHtml);

    res.redirect("/user/cart/order-confirmation");
  } catch (error) {
    console.error("Process Checkout Error:", error);
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


// controllers/cartController.js

const fetchLatestOrder = async (userId) => {
    try {
        const order = await Order.findOne({ user: userId })
            .sort({ createdAt: -1 })
            .populate("items.product");
        return order;
    } catch (error) {
        console.error("❌ Fetch Latest Order Error:", error.message);
        throw error;
    }
};

// controllers/cartController.js


exports.renderOrderConfirmation = async (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).render("auth/login", {
            error: "Please log in to view your order confirmation."
        });
    }

    try {
        const order = await fetchLatestOrder(req.user.userId);

        if (!order) {
            return res.status(404).render("cart/order-confirmation", { // Updated path
                user: req.user,
                order: null,
                errorMessage: "No recent order found."
            });
        }

        res.render("cart/order-confirmation", { // Updated path
            user: req.user,
            order,
            errorMessage: null
        });
    } catch (error) {
        console.error("❌ Order Confirmation Render Error:", error.message);
        res.status(500).render("cart/order-confirmation", { // Updated path
            user: req.user || null,
            order: null,
            errorMessage: "Server error. Please try again."
        });
    }
};


// Helper function to format order details as HTML for email
function generateOrderEmail(order) {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #ff0000;">Order Confirmation - ${order.orderId}</h2>
            <p>Thank you for your order! Below are the details:</p>
            <h3>Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f9fafb;">
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <h3>Totals</h3>
            <p>Subtotal: Rs ${order.subtotal.toFixed(2)}</p>
            <p>Shipping: Rs ${order.shipping.toFixed(2)}</p>
            <p>Tax: Rs ${order.tax.toFixed(2)}</p>
            <p><strong>Total: Rs ${order.totalAmount.toFixed(2)}</strong></p>
            <h3>Billing Information</h3>
            <p>${order.billingInfo.firstName}</p>
            <p>${order.billingInfo.streetAddress}${order.billingInfo.apartment ? ', ' + order.billingInfo.apartment : ''}</p>
            <p>${order.billingInfo.townCity}</p>
            <p>Phone: ${order.billingInfo.phoneNumber}</p>
            <p>Email: ${order.billingInfo.emailAddress}</p>
            <p>Payment Method: ${order.paymentMethod}</p>
            <p style="margin-top: 20px;">We’ll notify you once your order is processed. Thank you for shopping with us!</p>
        </body>
        </html>
    `;
}
