const Cart = require("../models/Cart");
const Product = require("../models/Product");



// ✅ Get User Cart
exports.renderCart = async (req, res) => {
    try {
      // Fetch cart with populated product details
      const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
  
      // Handle empty cart case
      if (!cart || cart.items.length === 0) {
        return res.render("cart/cart", { 
          user: req.user, 
          cart: [], 
          totalAmount: 0 
        });
      }
  
      // Calculate total cart amount
      const totalAmount = cart.items.reduce((total, item) => {
        return total + item.productId.price * item.quantity;
      }, 0);
  
      // Render cart page with data
      res.render("cart/cart", { 
        user: req.user, 
        cart: cart.items, 
        totalAmount 
      });
  
    } catch (error) {
      console.error("❌ Cart Page Error:", error);
      res.status(500).render("cart/cart", { 
        user: req.user, 
        cart: [], 
        totalAmount: 0, 
        errorMessage: "Server error. Please try again." 
      });
    }
  };

// ✅ Render Checkout Page
exports.renderCheckout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("cart.product");

        if (!user || user.cart.length === 0) {
            return res.redirect("/user/cart"); // ✅ Redirect if cart is empty
        }

        res.render("user/checkout", { user });
    } catch (error) {
        console.error("❌ Checkout Render Error:", error);
        res.status(500).send("Server error");
    }
};
  

// ✅ Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity: parseInt(quantity) || 1 }] });
    } else {
      const cartItem = cart.items.find((item) => item.productId.toString() === productId);
      if (cartItem) {
        cartItem.quantity += parseInt(quantity) || 1;
      } else {
        cart.items.push({ productId, quantity: parseInt(quantity) || 1 });
      }
    }

    await cart.save();
    return res.status(200).json({ success: "Product added to cart!" });
  } catch (error) {
    console.error("❌ Cart Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};

// ✅ Update Cart Quantity
exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);

        const cartItem = user.cart.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).send("Product not found in cart.");
        }

        cartItem.quantity = parseInt(quantity);
        await user.save();

        res.redirect("/user/cart");
    } catch (error) {
        console.error("❌ Update Cart Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    return res.status(200).json({ success: "Product removed from cart!" });
  } catch (error) {
    console.error("❌ Remove Cart Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};

// ✅ Clear Cart (After Checkout)
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    return res.status(200).json({ success: "Cart cleared successfully!" });
  } catch (error) {
    console.error("❌ Clear Cart Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};
