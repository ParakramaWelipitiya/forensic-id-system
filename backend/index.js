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
// Route to create a new unidentified remains case
app.post('/api/cases', async (req, res) => {
    try {
        // Extract the data sent from the React frontend
        const { caseNumber, location, notes } = req.body;

        // Package the text notes into a JSON object for the found_artifacts column
        const artifactsJson = JSON.stringify({ initial_notes: notes });

        // The SQL query to insert the data safely (using $1, $2 to prevent SQL injection)
        const newCase = await pool.query(
            `INSERT INTO unidentified_remains 
            (recovery_case_number, recovery_location, found_artifacts) 
            VALUES ($1, $2, $3) 
            RETURNING *`,
            [caseNumber, location, artifactsJson]
        );

        // Send a success response back to React
        res.status(201).json({
            message: "Case successfully logged to database.",
            case: newCase.rows[0]
        });

    } catch (err) {
        console.error("Database Insert Error:", err.message);
        // Send a 500 server error back if something goes wrong (e.g., duplicate case number)
        res.status(500).json({ error: "Failed to log case. Case number might already exist." });
    }
});

// Route to fetch all unidentified remains cases
app.get('/api/cases', async (req, res) => {
    try {
        // Fetch all rows, sorted by the newest first
        const allCases = await pool.query(
            'SELECT * FROM unidentified_remains ORDER BY created_at DESC'
        );
        
        res.json(allCases.rows);
    } catch (err) {
        console.error("Database Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch cases." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is locked in and running on port ${PORT}`);
});