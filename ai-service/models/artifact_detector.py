# ai-service/models/artifact_detector.py
from ultralytics import YOLO

class ArtifactDetector:
    def __init__(self):
        # Load model into memory only once when the class initializes
        self.model = YOLO('yolov8n.pt')

    def detect(self, img):
        """Runs inference to find personal belongings/artifacts"""
        results = self.model(img)
        detected_artifacts = []
        
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                label = self.model.names[class_id]
                confidence = float(box.conf[0])
                
                if confidence > 0.45:
                    artifact_entry = f"{label} (AI Conf: {int(confidence * 100)}%)"
                    if artifact_entry not in detected_artifacts:
                        detected_artifacts.append(artifact_entry)

        # Calculate average confidence or default to 0.85
        avg_conf = float(results[0].boxes.conf.mean() if len(results[0].boxes) > 0 else 0.85)

        if not detected_artifacts:
            detected_artifacts = ["No visually distinct personal belongings detected."]

        return detected_artifacts, round(avg_conf, 2)