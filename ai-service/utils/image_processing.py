# ai-service/utils/image_processing.py
import cv2
import numpy as np
from fastapi import HTTPException

def decode_image(image_bytes: bytes):
    """Converts raw HTTP file bytes into an OpenCV Image Matrix"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")
        
    return img