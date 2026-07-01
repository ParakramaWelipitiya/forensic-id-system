from fastapi import FastAPI, UploadFile, File, HTTPException
from utils.image_processing import decode_image
from models.artifact_detector import ArtifactDetector
from models.biological_estimator import BiologicalEstimator

app = FastAPI()

artifact_pipeline = ArtifactDetector()
bio_pipeline = BiologicalEstimator()

@app.get("/")
def read_root():
    return {"status": "Forensic AI Engine running Multi-Model Pipeline."}

@app.post("/analyze")
async def analyze_remains(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid image format.")

    try:
        contents = await file.read()
        img = decode_image(contents)
        
        artifacts, confidence = artifact_pipeline.detect(img)
        biological_profile = bio_pipeline.estimate(img)

        return {
            "filename": file.filename,
            "message": "Image processed via multi-model pipeline.",
            "ai_prediction": {
                **biological_profile,
                "confidence_score": confidence,
                "found_artifacts": {
                    "detected_items": artifacts
                }
            }
        }

    except Exception as e:
        print(f"Pipeline Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal processing error.")