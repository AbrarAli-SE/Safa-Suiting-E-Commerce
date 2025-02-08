exports.renderAddProduct = async (req, res) => {
    try {
        res.render("product/product-details");
    } catch (error) {
        console.error("❌ Render Add Product Error:", error);
        res.status(500).send("Server error");
    }
};

exports.renderProductList = async (req, res) => {
    try {
        res.render("product/product-list");
    } catch (error) {
        console.error("❌ Render Product List Error:", error);
        res.status(500).send("Server error");
    }
};
