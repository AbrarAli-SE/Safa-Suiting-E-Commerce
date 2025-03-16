require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

// Function to connect to MongoDB Atlas
module.exports = function connectDB() {
    // Define the MongoDB Atlas connection string from the environment variable
    const mongoURI = process.env.MONGO_URI;

    // Check if the MONGO_URI is defined
    if (!mongoURI) {
        console.error('❌ MongoDB URI is not defined in the .env file');
        process.exit(1); // Exit the process if the URI is missing
    }

    // Connect to MongoDB Atlas with recommended options
    mongoose.connect(mongoURI, {
        useNewUrlParser: true, // Use the new URL parser
        useUnifiedTopology: true, // Use the new topology engine
        serverSelectionTimeoutMS: 5000, // Timeout after 5s if server selection fails
        connectTimeoutMS: 10000, // Timeout after 10s if connection fails
    })
    .then(() => {
        console.log('🚀 MongoDB Atlas Connected Successfully');
    })
    .catch((err) => {
        console.error('❌ MongoDB Atlas Connection Error:', err);
        process.exit(1); // Exit the process on connection failure
    });

    // Event listeners for connection status
    mongoose.connection.on('connected', () => {
        console.log('📡 Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ Mongoose disconnected from MongoDB Atlas');
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('👋 Mongoose connection closed due to app termination');
        process.exit(0);
    });
};