const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User"); // ✅ Import User model


exports.addToCart = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract token from header
    const user = await User.findOne({ tokens: token }); // Find user by token

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId, quantity } = req.body;
    const product = await Product.findById(productId); // Find product by ID

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (cart) {
      let itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
      if (itemIndex > -1) {
        // Product exists in the cart, increase the quantity
        let productItem = cart.items[itemIndex];
        productItem.quantity += quantity;
        cart.items[itemIndex] = productItem;
      } else {
        // Product does not exist in the cart, add new item
        cart.items.push({ productId, quantity, price: product.price, image: product.image });
      }
      await cart.save();
      res.status(200).json({ message: "Cart updated!" });
    } else {
      // No cart for the user, create new cart
      const newCart = await Cart.create({
        userId: user._id,
        items: [{ productId, quantity, price: product.price, image: product.image }]
      });
      res.status(201).json({ message: "New cart created!", cart: newCart });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Error updating cart" });
  }
};

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


