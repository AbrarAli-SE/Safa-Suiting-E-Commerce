// utils/guestId.js
const { v4: uuidv4 } = require('uuid');

const getOrCreateGuestId = (req, res) => {
    let guestId = req.cookies.guestId;
    if (!guestId) {
        guestId = uuidv4(); // Generate a new UUID, e.g., "550e8400-e29b-41d4-a716-446655440000"
        res.cookie('guestId', guestId, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
    }
    return guestId;
};

module.exports = { getOrCreateGuestId };