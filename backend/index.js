const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || "forensic_intelligence_protocol_secret_key";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied. Authentication token missing." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Session expired or invalid token." });
        req.user = user;
        next();
    });
};

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, role',
            [username, hashedPassword]
        );
        res.status(201).json({ message: "User registered successfully.", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Username already exists or database failure." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) return res.status(400).json({ error: "Invalid username credentials." });

        const user = userQuery.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: "Invalid password credentials." });

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ message: "Authentication successful.", token, user: { username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: "Internal server authentication error." });
    }
});

app.post('/api/cases', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { caseNumber, location, notes } = req.body;
        if (!req.file) return res.status(400).json({ error: "Postmortem image is required for AI analysis." });

        const aiFormData = new FormData();
        aiFormData.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
        const pythonResponse = await axios.post(`${aiServiceUrl}/analyze`, aiFormData, { headers: { ...aiFormData.getHeaders() } });

        const aiData = pythonResponse.data.ai_prediction;
        const combinedArtifacts = JSON.stringify({ investigator_notes: notes, ai_detected_items: aiData.found_artifacts.detected_items });

        const newCase = await pool.query(
            `INSERT INTO unidentified_remains 
            (recovery_case_number, recovery_location, found_artifacts, predicted_sex, predicted_age_min, predicted_age_max, predicted_height_cm_min, predicted_height_cm_max, ai_confidence_score) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [caseNumber, location, combinedArtifacts, aiData.predicted_sex, aiData.predicted_age_min, aiData.predicted_age_max, aiData.predicted_height_cm_min, aiData.predicted_height_cm_max, aiData.confidence_score]
        );
        res.status(201).json({ message: "Case logged and AI analysis complete.", case: newCase.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Internal processing error during core analysis workflow." });
    }
});

app.get('/api/cases', authenticateToken, async (req, res) => {
    try {
        const allCases = await pool.query('SELECT * FROM unidentified_remains WHERE is_archived = FALSE ORDER BY created_at DESC');
        res.json(allCases.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch active cases." });
    }
});

app.put('/api/cases/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const caseId = req.params.id;
        const { caseNumber, location, notes } = req.body;
        const currentCase = await pool.query('SELECT * FROM unidentified_remains WHERE id = $1', [caseId]);
        if (currentCase.rows.length === 0) return res.status(404).json({ error: "Case target not found." });

        let artifacts = currentCase.rows[0].found_artifacts || {};
        artifacts.investigator_notes = notes;

        if (req.file) {
            const aiFormData = new FormData();
            aiFormData.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
            const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
            const pythonResponse = await axios.post(`${aiServiceUrl}/analyze`, aiFormData, { headers: { ...aiFormData.getHeaders() } });
            const aiData = pythonResponse.data.ai_prediction;

            artifacts.ai_detected_items = aiData.found_artifacts.detected_items; 

            const updated = await pool.query(
                `UPDATE unidentified_remains SET 
                recovery_case_number = $1, recovery_location = $2, found_artifacts = $3,
                predicted_sex = $4, predicted_age_min = $5, predicted_age_max = $6,
                predicted_height_cm_min = $7, predicted_height_cm_max = $8, ai_confidence_score = $9
                WHERE id = $10 RETURNING *`,
                [caseNumber, location, JSON.stringify(artifacts), aiData.predicted_sex, aiData.predicted_age_min, aiData.predicted_age_max, aiData.predicted_height_cm_min, aiData.predicted_height_cm_max, aiData.confidence_score, caseId]
            );
            return res.json({ message: "Case updated and AI metrics recalculated.", case: updated.rows[0] });
        } else {
            const updated = await pool.query(
                'UPDATE unidentified_remains SET recovery_case_number = $1, recovery_location = $2, found_artifacts = $3 WHERE id = $4 RETURNING *',
                [caseNumber, location, JSON.stringify(artifacts), caseId]
            );
            return res.json({ message: "Case metrics updated successfully.", case: updated.rows[0] });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to process profile edits." });
    }
});

app.patch('/api/cases/:id/archive', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE unidentified_remains SET is_archived = TRUE WHERE id = $1', [req.params.id]);
        res.json({ message: "Case successfully relocated to cold storage." });
    } catch (err) {
        res.status(500).json({ error: "Archival process exception encountered." });
    }
});

app.patch('/api/cases/:id/restore', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE unidentified_remains SET is_archived = FALSE WHERE id = $1', [req.params.id]);
        res.json({ message: "Case entry successfully restored." });
    } catch (err) {
        res.status(500).json({ error: "Restoration operation failed." });
    }
});

app.delete('/api/cases/:id/permanent', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM unidentified_remains WHERE id = $1 AND is_archived = TRUE', [req.params.id]);
        res.json({ message: "Case permanently purged from the global database." });
    } catch (err) {
        res.status(500).json({ error: "Permanent deletion operation failed." });
    }
});

app.get('/api/cases/:id/matches', authenticateToken, async (req, res) => {
    try {
        const caseId = req.params.id;
        const targetCase = await pool.query('SELECT * FROM unidentified_remains WHERE id = $1 AND is_archived = FALSE', [caseId]);
        if (targetCase.rows.length === 0) return res.status(404).json({ error: "Active case context mismatch." });

        const unidentified = targetCase.rows[0];
        if (!unidentified.predicted_sex) return res.json({ message: "Awaiting AI analysis before matching.", matches: [] });

        const baseMatches = await pool.query(
            `SELECT * FROM missing_persons WHERE biological_sex = $1 AND is_archived = FALSE AND ((age_min <= $2 AND age_max >= $3) OR (age_min >= $3 AND age_min <= $2) OR (age_max >= $3 AND age_max <= $2))`,
            [unidentified.predicted_sex, unidentified.predicted_age_max, unidentified.predicted_age_min]
        );

        const aiDetectedItems = unidentified.found_artifacts?.ai_detected_items || [];
        const cleanAiItems = aiDetectedItems.map(item => item.split('(')[0].trim().toLowerCase());

        const scoredMatches = baseMatches.rows.map(person => {
            let scorePoints = 50; 
            let matchingArtifactsFound = [];
            const personBelongingsString = Object.values(person.artifacts || {}).join(" ").toLowerCase();

            cleanAiItems.forEach(aiItem => {
                if (aiItem !== "no visually distinct personal belongings detected." && personBelongingsString.includes(aiItem)) {
                    scorePoints += 25; 
                    matchingArtifactsFound.push(aiItem);
                }
            });

            if (unidentified.recovery_location && person.last_known_location) {
                const recoveredLoc = unidentified.recovery_location.toLowerCase();
                const lastKnownLoc = person.last_known_location.toLowerCase();
                if (recoveredLoc.includes(lastKnownLoc) || lastKnownLoc.includes(recoveredLoc)) scorePoints += 15; 
            }

            return { ...person, match_probability: Math.min(scorePoints, 100), matched_evidence: matchingArtifactsFound };
        });

        scoredMatches.sort((a, b) => b.match_probability - a.match_probability);
        res.json({ target_case: unidentified.recovery_case_number, total_matches_found: scoredMatches.length, matches: scoredMatches });
    } catch (err) {
        res.status(500).json({ error: "Failed to compile smart cross-references." });
    }
});

app.get('/api/missing', authenticateToken, async (req, res) => {
    try {
        const allMissing = await pool.query('SELECT * FROM missing_persons WHERE is_archived = FALSE ORDER BY created_at DESC');
        res.json(allMissing.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch active missing persons." });
    }
});

app.post('/api/missing', authenticateToken, async (req, res) => {
    try {
        const { caseNumber, firstName, lastName, ageMin, ageMax, biologicalSex, heightMin, heightMax, location, artifacts } = req.body;
        const artifactsJson = JSON.stringify({ description: artifacts });
        const newMissingPerson = await pool.query(
            `INSERT INTO missing_persons (case_number, first_name, last_name, age_min, age_max, biological_sex, height_cm_min, height_cm_max, last_known_location, artifacts) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [caseNumber, firstName, lastName, ageMin, ageMax, biologicalSex, heightMin, heightMax, location, artifactsJson]
        );
        res.status(201).json({ message: "Missing person record successfully registered.", person: newMissingPerson.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to register missing person." });
    }
});

app.put('/api/missing/:id', authenticateToken, async (req, res) => {
    try {
        const { caseNumber, firstName, lastName, ageMin, ageMax, biologicalSex, heightMin, heightMax, location, artifacts } = req.body;
        const artifactsJson = JSON.stringify({ description: artifacts });
        const updated = await pool.query(
            `UPDATE missing_persons SET 
            case_number = $1, first_name = $2, last_name = $3, age_min = $4, age_max = $5,
            biological_sex = $6, height_cm_min = $7, height_cm_max = $8, last_known_location = $9, artifacts = $10
            WHERE id = $11 RETURNING *`,
            [caseNumber, firstName, lastName, ageMin, ageMax, biologicalSex, heightMin, heightMax, location, artifactsJson, req.params.id]
        );
        res.json({ message: "Missing person profile updated successfully.", person: updated.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to update missing person profile." });
    }
});

app.patch('/api/missing/:id/archive', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE missing_persons SET is_archived = TRUE WHERE id = $1', [req.params.id]);
        res.json({ message: "Profile relocated to archival array logs successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to execute profile soft delete." });
    }
});

app.patch('/api/missing/:id/restore', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE missing_persons SET is_archived = FALSE WHERE id = $1', [req.params.id]);
        res.json({ message: "Profile successfully re-indexed into target tables." });
    } catch (err) {
        res.status(500).json({ error: "Restoration mechanism fault." });
    }
});

app.delete('/api/missing/:id/permanent', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM missing_persons WHERE id = $1 AND is_archived = TRUE', [req.params.id]);
        res.json({ message: "Missing person permanently purged." });
    } catch (err) {
        res.status(500).json({ error: "Permanent deletion operation failed." });
    }
});

app.get('/api/archive', authenticateToken, async (req, res) => {
    try {
        const archivedCases = await pool.query('SELECT * FROM unidentified_remains WHERE is_archived = TRUE ORDER BY created_at DESC');
        const archivedMissing = await pool.query('SELECT * FROM missing_persons WHERE is_archived = TRUE ORDER BY created_at DESC');
        res.json({ cases: archivedCases.rows, missing_persons: archivedMissing.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to resolve archive indexes." });
    }
});

app.delete('/api/system/purge-all', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM unidentified_remains');
        await pool.query('DELETE FROM missing_persons');
        res.json({ message: "Global system purge executed successfully." });
    } catch (err) {
        console.error("System Purge Error:", err.message);
        res.status(500).json({ error: "Failed to execute global database purge." });
    }
});

app.listen(PORT, () => console.log(`Server is locked in and running on port ${PORT}`));