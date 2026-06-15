// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // Import the database connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health-check route
app.get('/api/status', (req, res) => {
    res.json({ 
        message: "Forensic ID System Backend is operational.",
        timestamp: new Date()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is locked in and running on port ${PORT}`);
});