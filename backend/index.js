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
// backend/index.js (Updated POST route with explicit IPv4 and enhanced debugging)
app.post('/api/cases', upload.single('image'), async (req, res) => {
    try {
        const { caseNumber, location, notes } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Postmortem image is required for AI analysis." });
        }

        console.log(`Processing case ${caseNumber}. Forwarding image to AI...`);

        // 1. Package the image using explicit metadata options for the binary stream
        const aiFormData = new FormData();
        aiFormData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // 2. Target explicit IPv4 (127.0.0.1) instead of 'localhost'
        // This completely bypasses the Node.js 18+ IPv6 lookup bug.
        const pythonResponse = await axios.post('http://127.0.0.1:8000/analyze', aiFormData, {
            headers: {
                ...aiFormData.getHeaders(),
            },
        });

        const aiData = pythonResponse.data.ai_prediction;
        console.log(`AI Prediction received successfully for case: ${caseNumber}`);

        // 3. Combine investigator notes with AI classifications
        const combinedArtifacts = JSON.stringify({
            investigator_notes: notes,
            ai_detected_items: aiData.found_artifacts.detected_items
        });

        // 4. Record entry to PostgreSQL database
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
        // ENHANCED VERBOSE LOGGING - This breaks open hidden errors
        console.error("\n================= SYSTEM ERROR DETAILS =================");
        if (err.response) {
            // The Python AI service received the request but rejected it with an error code
            console.error(`Python Server Rejected Request. Status Code: ${err.response.status}`);
            console.error("Python Server Response Data:", err.response.data);
        } else if (err.request) {
            // Node.js reached out to the port but received absolutely no response
            console.error("No communication returned from Python service.");
            console.error("Verification Steps: Is your Python virtual environment active and running uvicorn on port 8000?");
        } else {
            // An internal JavaScript runtime error occurred within Node.js
            console.error("Internal Runtime Error Message:", err.message);
        }
        console.error("Raw Exception Structure:", err);
        console.error("========================================================\n");

        res.status(500).json({ error: "Internal processing error during core analysis workflow." });
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

// backend/index.js (Upgraded Matching Algorithm with Artifact Weighting)
app.get('/api/cases/:id/matches', async (req, res) => {
    try {
        const caseId = req.params.id;

        // 1. Get the target unidentified remains case analyzed by AI
        const targetCase = await pool.query(
            'SELECT * FROM unidentified_remains WHERE id = $1',
            [caseId]
        );

        if (targetCase.rows.length === 0) {
            return res.status(404).json({ error: "Case not found." });
        }

        const unidentified = targetCase.rows[0];

        if (!unidentified.predicted_sex) {
            return res.json({ message: "Awaiting AI analysis before matching.", matches: [] });
        }

        // 2. Fetch all missing persons that match the basic biological profile (Sex & Age Overlap)
        const baseMatches = await pool.query(
            `SELECT * FROM missing_persons 
             WHERE biological_sex = $1
             AND (
                 (age_min <= $2 AND age_max >= $3) OR
                 (age_min >= $3 AND age_min <= $2) OR
                 (age_max >= $3 AND age_max <= $2)
             )`,
            [unidentified.predicted_sex, unidentified.predicted_age_max, unidentified.predicted_age_min]
        );

        // 3. Extract the clean list of items detected by YOLOv8
        // Our database stores it inside found_artifacts -> ai_detected_items
        const aiDetectedItems = unidentified.found_artifacts?.ai_detected_items || [];
        
        // Clean up the strings (e.g., convert "watch (AI Conf: 85%)" into just "watch")
        const cleanAiItems = aiDetectedItems.map(item => 
            item.split('(')[0].trim().toLowerCase()
        );

        // 4. Calculate a matching score for each missing person based on evidence/location
        const scoredMatches = baseMatches.rows.map(person => {
            let scorePoints = 50; // Base score for biological profile match
            let matchingArtifactsFound = [];

            // Look inside the missing person's artifacts JSON object
            const personArtifactsJson = person.artifacts || {};
            // Convert all text values of their belongings to a single lowercase string string to scan
            const personBelongingsString = Object.values(personArtifactsJson).join(" ").toLowerCase();

            // Compare each AI detected item against the missing person's report
            cleanAiItems.forEach(aiItem => {
                if (aiItem !== "no visually distinct personal belongings detected." && personBelongingsString.includes(aiItem)) {
                    scorePoints += 25; // Award 25 points for every physical item match!
                    matchingArtifactsFound.push(aiItem);
                }
            });

            // Geospatial Boost: If the recovery location matches the last known location city/district
            if (unidentified.recovery_location && person.last_known_location) {
                const recoveredLoc = unidentified.recovery_location.toLowerCase();
                const lastKnownLoc = person.last_known_location.toLowerCase();
                if (recoveredLoc.includes(lastKnownLoc) || lastKnownLoc.includes(recoveredLoc)) {
                    scorePoints += 15; // Award 15 points for location proximity
                }
            }

            return {
                ...person,
                match_probability: Math.min(scorePoints, 100), // Cap at 100%
                matched_evidence: matchingArtifactsFound
            };
        });

        // 5. Sort the results so the highest probability match appears first
        scoredMatches.sort((a, b) => b.match_probability - a.match_probability);

        res.json({
            target_case: unidentified.recovery_case_number,
            total_matches_found: scoredMatches.length,
            matches: scoredMatches
        });

    } catch (err) {
        console.error("Advanced Matching Engine Error:", err.message);
        res.status(500).json({ error: "Failed to compile smart cross-references." });
    }
});

app.post('/api/missing', async (req, res) => {
    try {
        const { 
            caseNumber, firstName, lastName, 
            ageMin, ageMax, biologicalSex, 
            heightMin, heightMax, location, artifacts 
        } = req.body;

        // Convert the comma-separated or raw text artifacts into a structured JSON object
        const artifactsJson = JSON.stringify({ description: artifacts });

        const newMissingPerson = await pool.query(
            `INSERT INTO missing_persons 
            (case_number, first_name, last_name, age_min, age_max, 
             biological_sex, height_cm_min, height_cm_max, last_known_location, artifacts) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                caseNumber, firstName, lastName, ageMin, ageMax, 
                biologicalSex, heightMin, heightMax, location, artifactsJson
            ]
        );

        res.status(201).json({
            message: "Missing person record successfully registered.",
            person: newMissingPerson.rows[0]
        });

    } catch (err) {
        console.error("Missing Registry Error:", err.message);
        res.status(500).json({ error: "Failed to register missing person. Case number may be duplicate." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is locked in and running on port ${PORT}`);
});