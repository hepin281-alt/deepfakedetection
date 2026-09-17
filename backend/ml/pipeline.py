import os
from ml.face_extractor import FaceExtractor
from ml.detector import DeepfakeDetector

class MLPipeline:
    def __init__(self):
        import torch
        if torch.cuda.is_available():
            self.device = 'cuda'
        elif torch.backends.mps.is_available():
            self.device = 'mps'
        else:
            self.device = 'cpu'
        
        self.extractor = FaceExtractor(device=self.device)
        
        # Check if custom weights exist
        model_path = "deepfake_model_weights.pth"
        if not os.path.exists(model_path):
            # Try looking in the parent directory as well depending on where it's run
            if os.path.exists("../deepfake_model_weights.pth"):
                model_path = "../deepfake_model_weights.pth"
            else:
                model_path = None
                
        self.detector = DeepfakeDetector(model_path=model_path, device=self.device)
        
    def analyze_image(self, image_path):
        faces = self.extractor.extract_faces_from_image(image_path)
        
        if not faces:
            return {"status": "error", "message": "No faces detected in the image."}
            
        scores = []
        for face in faces:
            score = self.detector.predict(face)
            scores.append(score)
            
        avg_score = sum(scores) / len(scores)
        
        return {
            "status": "success",
            "faces_detected": len(faces),
            "fake_probability": avg_score,
            "prediction": "Fake" if avg_score > 0.5 else "Real"
        }

    def analyze_video(self, video_path):
        faces = self.extractor.extract_faces_from_video(video_path, frame_rate=1)
        
        if not faces:
            return {"status": "error", "message": "No faces detected in the video."}
            
        scores = []
        for face in faces:
            score = self.detector.predict(face)
            scores.append(score)
            
        avg_score = sum(scores) / len(scores)
        
        return {
            "status": "success",
            "frames_analyzed": len(faces),
            "fake_probability": avg_score,
            "prediction": "Fake" if avg_score > 0.5 else "Real"
        }
