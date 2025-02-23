const Cart = require("../models/Cart");
const Product = require("../models/Product");


exports.addToCart = async (req, res) => {
    const { productId } = req.body; // Get product ID from AJAX request

    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
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
            // If product already exists, increase its quantity
            existingItem.quantity += 1;
        } else {
            // If product is not in the cart, add it as a new item
            cart.items.push({
                product: product._id,
                name: product.name,  // Store product name
                img: product.image,    // Store product image
                price: product.price, // Store product price
                quantity: 1           // Default quantity to 1
            });
        }

        // Calculate total price (sum of all items' price * quantity)
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save the updated cart to the database
        await cart.save();
        
        // Send response back to frontend
        return res.json({ success: true, message: "Product added to cart successfully!", cart });

    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};



// ✅ Get User Cart
exports.renderCart = async (req, res) => {
  try {
      // Fetch cart with populated product details
      const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

      // Handle empty cart case
      if (!cart || cart.items.length === 0) {
          return res.render("cart/cart", { 
              user: req.user, 
              cart: [], 
              totalAmount: 0 
          });
      }

      // Calculate total cart amount (sum of product price * quantity)
      const totalAmount = cart.items.reduce((total, item) => {
          return total + item.product.price * item.quantity;
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
  




exports.updateCart = async (req, res) => {
    const { updatedItems } = req.body; // Array of updated items with itemId and quantity

    if (!req.user) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
        // Find the user's cart
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

        // Save the updated cart to the database
        await cart.save();

        // Clean up the response to return plain IDs
        const updatedCart = cart.toObject();
        updatedCart.items = updatedCart.items.map(item => {
            item._id = item._id.toString(); // Convert ObjectId to string
            return item;
        });

        return res.json({ success: true, cart: updatedCart });

    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};



exports.deleteItem = async (req, res) => {
    const { itemId } = req.params; // The item ID to be removed

    if (!req.user) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        // Find and remove the item from the cart
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Recalculate the total price
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save the updated cart to the database
        await cart.save();

        return res.json({ success: true, message: "Item removed from cart.", cart });

    } catch (error) {
        console.error("Delete Item Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};


