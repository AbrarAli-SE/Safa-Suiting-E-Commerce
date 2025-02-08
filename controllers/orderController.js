exports.renderUserCancel = async (req, res) => {
    try {
        res.render("orders/order-cancel");
    } catch (error) {
        console.error("❌ User Cancel Order Error:", error);
        res.status(500).send("Server error");
    }
};

exports.renderCartOrder = async (req, res) => {
    try {
        res.render("orders/order-summary");
    } catch (error) {
        console.error("❌ Render Product List Error:", error);
        res.status(500).send("Server error");
    }
};
