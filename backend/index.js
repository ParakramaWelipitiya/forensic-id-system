// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // Import the database connection
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || "forensic_intelligence_protocol_secret_key";

// Middleware to verify JWT token and protect sensitive forensic routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access denied. Authentication token missing." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Session expired or invalid token." });
        }
        req.user = user; // Attach user info to the request object
        next(); // Pass control to the next route handler
    });
};

// Middleware
app.use(cors());
app.use(express.json());

// Route to create a new investigator account (Seed account setup)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Hash the password using a salt factor of 10 rounds
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, role',
            [username, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully.", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Username already exists or database failure." });
    }
});

// Route to log in an investigator and issue a secure JWT session token
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ error: "Invalid username credentials." });
        }

        const user = userQuery.rows[0];

        // Compare incoming plain-text password with the database hash
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password credentials." });
        }

        // Generate the JWT token (Expires in 2 hours)
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: "Authentication successful.",
            token: token,
            user: { username: user.username, role: user.role }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal server authentication error." });
    }
});

// Basic health-check route
app.get('/api/status', (req, res) => {
    res.json({ 
        message: "Forensic ID System Backend is operational.",
        timestamp: new Date()
    });
});
// backend/index.js (Updated POST route with explicit IPv4 and enhanced debugging)
app.post('/api/cases',authenticateToken, upload.single('image'), async (req, res) => {
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
app.get('/api/cases',authenticateToken, async (req, res) => {
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
app.get('/api/cases/:id/matches', authenticateToken, async (req, res) => {
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

app.post('/api/missing', authenticateToken, async (req, res) => {
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