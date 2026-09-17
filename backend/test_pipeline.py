import os
import asyncio
from ml.pipeline import MLPipeline

def test_pipeline():
    print("Initializing ML Pipeline...")
    pipeline = MLPipeline()
    print("Pipeline initialized successfully!")
    
    # We don't have a real image yet, but we can just ensure it instantiates properly
    print("Backend is ready for testing.")

if __name__ == "__main__":
    test_pipeline()
