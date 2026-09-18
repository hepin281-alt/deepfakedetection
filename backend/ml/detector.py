import torch
import torchvision.transforms as transforms
from torchvision import models
import torch.nn as nn

class DeepfakeDetector:
    def __init__(self, model_path=None, device='cpu'):
        # FORCE CPU for now: MPS has a known bug with AdaptiveAvgPool2d on EfficientNet
        # that ignores the PYTORCH_ENABLE_MPS_FALLBACK=1 flag in some versions.
        # CPU inference for a single image on Apple Silicon is extremely fast anyway.
        self.device = 'cpu' 
        
        # For this prototype, we'll use a pre-trained EfficientNet from torchvision.
        # In a real scenario, you'd load weights fine-tuned on FaceForensics++ here.
        self.model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        
        # modify the classifier layer for binary classification (Real vs Fake)
        num_ftrs = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(num_ftrs, 1) 
        
        if model_path:
            # load specific deepfake weights if provided
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            
        self.model = self.model.to(self.device)
        self.model.eval() # set to evaluation mode
        
        # Standard ImageNet transforms
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
    def predict(self, face_image):
        """
        Predict whether a single face image is real or fake.
        Returns a score between 0 (Real) and 1 (Fake).
        """
        # Preprocess the image
        img_tensor = self.transform(face_image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            output = self.model(img_tensor)
            # Use sigmoid to get probability
            prob = torch.sigmoid(output).item()
            
        return prob
