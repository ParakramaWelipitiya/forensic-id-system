// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // Import the database connection
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });

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
app.post('/api/cases', upload.single('image'), async (req, res) => {
    try {
        const { caseNumber, location, notes } = req.body;

        // 1. Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ error: "Postmortem image is required for AI analysis." });
        }

        console.log(`Processing case ${caseNumber}. Forwarding image to AI...`);

        // 2. Package the image to send to the Python Microservice
        const aiFormData = new FormData();
        aiFormData.append('file', req.file.buffer, req.file.originalname);

        // 3. Send to Python (Running on Port 8000)
        const pythonResponse = await axios.post('http://localhost:8000/analyze', aiFormData, {
            headers: {
                ...aiFormData.getHeaders(),
            },
        });

        const aiData = pythonResponse.data.ai_prediction;
        console.log("AI Prediction Received:", aiData);

        // 4. Combine investigator notes with AI found artifacts
        const combinedArtifacts = JSON.stringify({
            investigator_notes: notes,
            ai_detected_items: aiData.found_artifacts.detected_items
        });

        // 5. Save EVERYTHING to PostgreSQL
        const newCase = await pool.query(
            `INSERT INTO unidentified_remains 
            (recovery_case_number, recovery_location, found_artifacts, 
             predicted_sex, predicted_age_min, predicted_age_max, 
             predicted_height_cm_min, predicted_height_cm_max, ai_confidence_score) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                caseNumber, location, combinedArtifacts,
                aiData.predicted_sex, aiData.predicted_age_min, aiData.predicted_age_max,
                aiData.predicted_height_cm_min, aiData.predicted_height_cm_max, aiData.confidence_score
            ]
        );

        res.status(201).json({
            message: "Case logged and AI analysis complete.",
            case: newCase.rows[0]
        });

    } catch (err) {
        console.error("System Error:", err.message);
        res.status(500).json({ error: "Failed to process case and communicate with AI." });
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

// Route to find potential matches for a specific unidentified case
app.get('/api/cases/:id/matches', async (req, res) => {
    try {
        const caseId = req.params.id;

        // 1. Get the target unidentified case and its AI predictions
        const targetCase = await pool.query(
            'SELECT * FROM unidentified_remains WHERE id = $1',
            [caseId]
        );

        if (targetCase.rows.length === 0) {
            return res.status(404).json({ error: "Case not found." });
        }

        const aiData = targetCase.rows[0];

        // If AI hasn't processed it yet, we can't match it
        if (!aiData.predicted_sex) {
            return res.json({ message: "Awaiting AI analysis before matching.", matches: [] });
        }

        // 2. The Matching Query
        // This SQL query looks for missing persons with the exact same sex, 
        // AND where the missing person's age overlaps with the AI's predicted age range.
        const matches = await pool.query(
            `SELECT * FROM missing_persons 
             WHERE biological_sex = $1
             AND (
                 (age_min <= $2 AND age_max >= $3) OR -- AI range falls inside Missing Person range
                 (age_min >= $3 AND age_min <= $2) OR -- Missing Person min age falls inside AI range
                 (age_max >= $3 AND age_max <= $2)    -- Missing Person max age falls inside AI range
             )
             ORDER BY created_at DESC`,
            [
                aiData.predicted_sex, 
                aiData.predicted_age_max, // $2
                aiData.predicted_age_min  // $3
            ]
        );

        res.json({
            target_case: targetCase.rows[0].recovery_case_number,
            total_matches_found: matches.rows.length,
            matches: matches.rows
        });

    } catch (err) {
        console.error("Matching Algorithm Error:", err.message);
        res.status(500).json({ error: "Failed to run cross-reference matching." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is locked in and running on port ${PORT}`);
});