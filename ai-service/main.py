# ai-service/main.py
from fastapi import FastAPI, UploadFile, File
import random
import time

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Forensic AI Engine is online and ready for images."}

@app.post("/analyze")
async def analyze_remains(file: UploadFile = File(...)):
    print(f"Receiving file for analysis: {file.filename}")
    
    # Simulate the time it takes for a complex AI model to process an image
    # (Remove this in production!)
    time.sleep(2) 
    
    # ---------------------------------------------------------
    # TODO: In Phase 2, integrate actual PyTorch/YOLO model here.
    # For now, we generate realistic simulated predictions.
    # ---------------------------------------------------------
    
    mock_confidence = round(random.uniform(0.72, 0.98), 2)
    predicted_sex = random.choice(["Male", "Female", "Unknown"])
    
    return {
        "filename": file.filename,
        "message": "Image processed successfully.",
        "ai_prediction": {
            "predicted_sex": predicted_sex,
            "predicted_age_min": random.randint(20, 30),
            "predicted_age_max": random.randint(35, 50),
            "predicted_height_cm_min": 160.0,
            "predicted_height_cm_max": 185.0,
            "confidence_score": mock_confidence,
            "found_artifacts": {
                "detected_items": ["metallic watch", "synthetic fabric fibers"]
            }
        }
    }