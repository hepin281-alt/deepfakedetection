import os
import cv2
from pathlib import Path
from tqdm import tqdm
from ml.face_extractor import FaceExtractor

# --- CONFIGURATION ---
# Change these paths to point to where you downloaded the FaceForensics++ videos
REAL_VIDEOS_DIR = "raw_data/original_sequences/youtube/c23/videos"
FAKE_VIDEOS_DIR = "raw_data/manipulated_sequences/Deepfakes/c23/videos"

# The output directory that the training script expects
OUTPUT_DIR = "dataset"
FRAMES_PER_VIDEO = 10  # How many faces to extract per video to avoid massive datasets
# ---------------------

def prepare_directories():
    for split in ['train', 'val']:
        for label in ['real', 'fake']:
            os.makedirs(os.path.join(OUTPUT_DIR, split, label), exist_ok=True)

def process_videos(video_dir, label, split_ratio=0.8):
    if not os.path.exists(video_dir):
        print(f"Warning: Directory not found: {video_dir}")
        return

    video_files = list(Path(video_dir).glob("*.mp4"))
    if not video_files:
        print(f"No videos found in {video_dir}")
        return

    extractor = FaceExtractor()
    
    # Split into train/val
    split_index = int(len(video_files) * split_ratio)
    train_videos = video_files[:split_index]
    val_videos = video_files[split_index:]

    def extract_and_save(videos, split_name):
        print(f"Processing {len(videos)} {label} videos for {split_name}...")
        
        for idx, video_path in enumerate(tqdm(videos)):
            try:
                # We use a trick: calculate duration to roughly get N spread out frames
                cap = cv2.VideoCapture(str(video_path))
                fps = cap.get(cv2.CAP_PROP_FPS)
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                cap.release()
                
                if fps == 0 or frame_count == 0:
                    continue
                    
                duration_seconds = frame_count / fps
                
                # Extract faces (e.g., if duration is 10s and we want 10 frames, frame_rate = 1)
                frame_rate = max(1, FRAMES_PER_VIDEO / duration_seconds) 
                
                faces = extractor.extract_faces_from_video(str(video_path), frame_rate=frame_rate)
                
                # Save extracted faces
                for face_idx, face in enumerate(faces[:FRAMES_PER_VIDEO]): # Ensure we don't save too many per video
                    out_path = os.path.join(OUTPUT_DIR, split_name, label, f"{video_path.stem}_face_{face_idx}.jpg")
                    face.save(out_path, "JPEG")
                    
            except Exception as e:
                print(f"Error processing {video_path}: {e}")

    extract_and_save(train_videos, 'train')
    extract_and_save(val_videos, 'val')

if __name__ == "__main__":
    import sys
    try:
        import tqdm
    except ImportError:
        print("Installing tqdm for progress bars...")
        os.system(f"{sys.executable} -m pip install tqdm")
        from tqdm import tqdm

    print("Setting up dataset directories...")
    prepare_directories()
    
    print("\n--- Processing REAL Videos ---")
    process_videos(REAL_VIDEOS_DIR, 'real')
    
    print("\n--- Processing FAKE Videos ---")
    process_videos(FAKE_VIDEOS_DIR, 'fake')
    
    print(f"\nDone! Extracted faces are saved in the '{OUTPUT_DIR}' directory.")
    print("You can now run: python ml/train.py")
