module.exports = {
    secretKey: process.env.JWT_SECRET || "your_secret_key",
    expiresIn: "24h" // Token expires in 24 hours
};
