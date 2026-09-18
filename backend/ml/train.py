import os
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from tqdm import tqdm

DataLoader = torch.utils.data.DataLoader

# Construct path to dataset relative to this script's location
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "real-vs-fake")
BATCH_SIZE = 32
EPOCHS = 1
LEARNING_RATE = 0.001
MODEL_SAVE_PATH = "deepfake_model_weights.pth"

def get_data_loaders(dataset_dir, batch_size):
    """
    Expects directory structure:
    dataset_dir/
        train/
            real/
            fake/
        valid/
            real/
            fake/
    """
    train_dir = os.path.join(dataset_dir, 'train')
    val_dir = os.path.join(dataset_dir, 'valid')

    # Data augmentation and normalization for training
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Just normalization for validation
    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    return train_loader, val_loader

def build_model(device):
    # Load base model
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    
    # Modify the final layer for binary classification (Real vs Fake)
    num_ftrs = model.classifier[1].in_features
    
    # Assuming ImageFolder puts classes in alphabetical order: 'fake' (0), 'real' (1)
    # So we want 1 output neuron representing the probability. 
    # Alternatively, use 2 output neurons with CrossEntropyLoss. We will use 1 with BCEWithLogitsLoss.
    model.classifier[1] = nn.Linear(num_ftrs, 1)
    
    return model.to(device)

def train_model():
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
        
    print(f"Using device: {device}")

    if not os.path.exists(os.path.join(DATASET_DIR, 'train')):
        print(f"Error: Could not find training data in {DATASET_DIR}/train")
        print("Please ensure your dataset is structured correctly.")
        return

    train_loader, val_loader = get_data_loaders(DATASET_DIR, BATCH_SIZE)
    model = build_model(device)

    # Loss and Optimizer
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    best_val_loss = float('inf')

    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")
        model.train()
        running_loss = 0.0
        
        train_pbar = tqdm(train_loader, desc="Training")
        for inputs, labels in train_pbar:
            inputs = inputs.to(device)
            # labels are 0 or 1, we need them as floats for BCE loss
            labels = labels.float().unsqueeze(1).to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            train_pbar.set_postfix({'loss': f'{loss.item():.4f}'})
            
        epoch_loss = running_loss / len(train_loader.dataset)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        corrects = 0

        val_pbar = tqdm(val_loader, desc="Validation")
        with torch.no_grad():
            for inputs, labels in val_pbar:
                inputs = inputs.to(device)
                labels = labels.float().unsqueeze(1).to(device)

                outputs = model(inputs)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * inputs.size(0)

                # Calculate accuracy
                preds = torch.round(torch.sigmoid(outputs))
                corrects += torch.sum(preds == labels.data).item()  # .item() moves to CPU as plain Python int
                val_pbar.set_postfix({'loss': f'{loss.item():.4f}'})

        val_loss = val_loss / len(val_loader.dataset)
        val_acc = float(corrects) / len(val_loader.dataset)

        print(f"Train Loss: {epoch_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            print(f"--> Saved new best model to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_model()
