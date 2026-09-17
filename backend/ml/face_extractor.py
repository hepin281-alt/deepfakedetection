import cv2
import torch
from facenet_pytorch import MTCNN
from PIL import Image

class FaceExtractor:
    def __init__(self, device='cpu'):
        self.device = device
        # MTCNN for face detection
        self.mtcnn = MTCNN(keep_all=True, device=self.device, margin=20)
        
    def extract_faces_from_image(self, image_path):
        """
        Extract faces from a single image.
        Returns a list of PIL Images of the cropped faces.
        """
        img = Image.open(image_path).convert('RGB')
        
        # detect faces
        boxes, _ = self.mtcnn.detect(img)
        
        faces = []
        if boxes is not None:
            for box in boxes:
                # crop the image using the bounding box
                face = img.crop(box)
                faces.append(face)
                
        return faces

    def extract_faces_from_video(self, video_path, frame_rate=1):
        """
        Extract faces from video frames.
        frame_rate: number of frames to process per second of video.
        Returns a list of PIL Images.
        """
        video_capture = cv2.VideoCapture(video_path)
        fps = video_capture.get(cv2.CAP_PROP_FPS)
        
        # calculate how many frames to skip to achieve the desired frame_rate
        if fps == 0:
            frame_skip = 1
        else:
            frame_skip = int(fps / frame_rate)
            if frame_skip == 0:
                frame_skip = 1
        
        faces = []
        count = 0
        
        while video_capture.isOpened():
            success, frame = video_capture.read()
            if not success:
                break
                
            if count % frame_skip == 0:
                # Convert BGR (OpenCV) to RGB (PIL)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)
                
                # detect faces
                boxes, _ = self.mtcnn.detect(img)
                if boxes is not None:
                    for box in boxes:
                        face = img.crop(box)
                        faces.append(face)
            
            count += 1
            
        video_capture.release()
        return faces
