# Forensic Identity Platform

---

## Project Overview

The **Forensic Identity Platform** is a full-stack, microservice-based application engineered to assist law enforcement and forensic teams in identifying unknown human remains.

When investigators recover unidentified remains, they upload scene imagery and preliminary data to the platform. The system utilizes a Convolutional Neural Network (**YOLOv8**) to analyze the imagery and extract physical evidence (artifacts, clothing, accessories). This data, alongside estimated biological profiles, is processed by a custom algorithmic matching engine.

The engine cross-references these findings against a relational database of active missing persons, calculating a weighted probability score based on biological overlap, geospatial proximity, and matched physical artifacts, ultimately providing investigators with prioritized leads.

---

## System Architecture

The application is built on a distributed microservice architecture to ensure scalability and separation of concerns.

### Frontend Layer

| Component              | Technology | Purpose                                |
| ---------------------- | ---------- | -------------------------------------- |
| Investigator Dashboard | React.js   | Secure Single Page Application (SPA)   |
| Authentication UI      | React.js   | Login & session management             |
| Data Entry Portals     | React.js   | Missing persons and remains management |

### Backend Layer

| Component       | Technology        | Purpose                       |
| --------------- | ----------------- | ----------------------------- |
| API Gateway     | Node.js / Express | REST API, JWT authentication  |
| File Processing | Multer / Express  | Multipart file streaming      |
| Query Engine    | Node.js           | Algorithm-based data querying |

### Data Layer

| Component             | Technology | Purpose                        |
| --------------------- | ---------- | ------------------------------ |
| Primary Database      | PostgreSQL | Relational data storage        |
| Investigator Accounts | PostgreSQL | Hashed credentials             |
| Forensic Records      | PostgreSQL | Missing persons & remains data |

### AI Layer

| Component               | Technology       | Purpose                     |
| ----------------------- | ---------------- | --------------------------- |
| Computer Vision Service | Python / FastAPI | Independent ML microservice |
| Object Detection        | YOLOv8           | Evidence recognition        |
| Image Processing        | OpenCV           | Matrix pre-processing       |

---

## Prerequisites

To run this application locally, ensure the following are installed:

| Software   | Version |
| ---------- | ------- |
| Node.js    | v18+    |
| Python     | v3.10+  |
| PostgreSQL | v14+    |
| pgAdmin    | Latest  |
| Git        | Latest  |

---

# Installation & Setup Guide

---

## 1️⃣ Database Configuration

Open **pgAdmin** and create a new database named:

```sql
CREATE DATABASE forensic_db;
```

Open the Query Tool for **forensic_db** and execute:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'Investigator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE missing_persons (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age_min INT,
    age_max INT,
    biological_sex VARCHAR(20),
    height_cm_min DECIMAL(5,2),
    height_cm_max DECIMAL(5,2),
    last_known_location VARCHAR(255),
    artifacts JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidentified_remains (
    id SERIAL PRIMARY KEY,
    recovery_case_number VARCHAR(50) UNIQUE NOT NULL,
    recovery_location VARCHAR(255),
    found_artifacts JSONB,
    predicted_sex VARCHAR(20),
    predicted_age_min INT,
    predicted_age_max INT,
    predicted_height_cm_min DECIMAL(5,2),
    predicted_height_cm_max DECIMAL(5,2),
    ai_confidence_score DECIMAL(4,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2️⃣ Backend API Setup (Terminal 1)

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=forensic_db
JWT_SECRET=forensic_secret_key_123
```

Start the backend server:

```bash
npm run dev
```

---

## 3️⃣ AI Microservice Setup (Terminal 2)

Navigate to the AI service directory:

```bash
cd ai-service
python -m venv venv
```

### Activate Virtual Environment

**Windows**

```powershell
.\venv\Scripts\activate
```

**Mac/Linux**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install ultralytics fastapi uvicorn opencv-python-headless python-multipart
```

Start the AI server:

```bash
python -m uvicorn main:app --reload --port 8000
```

> **Note:** Upon first launch, YOLOv8 will automatically download its lightweight neural network weights `yolov8n.pt` into this directory.

---

## 4️⃣ Frontend Application Setup (Terminal 3)

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

---

# System Testing Workflow

Follow these steps to verify the application's complete end-to-end functionality.

---

## Step 1 — Create an Investigator Account

Because the application is secured by JWT, create a seed account before logging in.

### Windows PowerShell

> **Note:** Rename Username and Password.

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -ContentType "application/json" -Body '{"username":"agent001","password":"securepassword"}'
```

### Mac/Linux (cURL)

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"username":"agent001","password":"securepassword"}'
```

---

## Step 2 — Log into the Dashboard

Navigate to:

```text
http://localhost:5173
```

You will be intercepted by the security middleware and redirected to:

```text
/login
```

Login credentials:

```text
Username: agent001
Password: securepassword
```

You will receive a JWT session token and gain access to the platform dashboard.

---

## Step 3 — Register a Missing Person

Navigate to:

```text
Missing Persons Registry
```

Enter mock data for a missing individual.

Example:

```text
Amal Perera
Male
Age: 20-30
Location: Gampaha
```

### Crucial Testing Step

Inside the **Known Belongings** field, enter an object that YOLOv8 can recognize in common photographs.

Examples:

```text
leather backpack
metallic watch
```

Submit the form to save the record to PostgreSQL.

---

## Step 4 — Upload Unidentified Remains (AI Inference Test)

Navigate to:

```text
Upload Case Data
```

Enter:

```text
Recovery Case Number
Recovery Location (Example: Gampaha)
```

### Upload an Image

Select an image that clearly contains the object entered during Step 3.

Examples:

```text
Backpack
Watch
```

Click **Submit**.

The Node.js server will:

1. Intercept the multipart request.
2. Forward the image matrix to FastAPI.
3. Execute YOLOv8 inference.
4. Save classified objects to PostgreSQL.

---

## Step 5 — Run the Cross-Reference Algorithm

Navigate back to:

```text
Dashboard
```

Locate the newly uploaded unidentified remains record.

You should see:

```text
Analysis Complete
```

Click:

```text
View Matches
```

The platform will:

* Query the database.
* Execute the weighted matching algorithm.
* Calculate similarity scores.
* Display probable missing-person matches.
* Highlight linked physical evidence discovered by AI.

The missing person created in Step 3 should appear as a high-probability match.

---

#  Author

**Parakrama Welipitiya**

---

## Technology Stack

```text
Frontend     : React.js
Backend      : Node.js + Express
Database     : PostgreSQL
AI Service   : Python + FastAPI
Computer Vision : YOLOv8
Image Processing : OpenCV
Authentication : JWT
Architecture : Microservices
```