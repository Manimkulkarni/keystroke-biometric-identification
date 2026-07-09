"""
Startup script that runs before the FastAPI app starts.
Checks for pre-trained models from Git LFS.
"""
import os
import sys
import subprocess
from pathlib import Path
from utils.logger import logger

def train_model_if_not_exists():
    """Check if models exist. Train only if missing."""
    
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    models_dir.mkdir(exist_ok=True)
    
    # ============================================
    # 1. Check for GREYC Model
    # ============================================
    greyc_model_path = models_dir / "typeprint_p5_model.pkl"
    
    if greyc_model_path.exists():
        logger.info("✅ GREYC model found (from Git LFS). Skipping training.")
    else:
        logger.info("🔧 GREYC model not found. Training from dataset...")
        
        # Check if dataset exists
        data_path = base_dir / "data" / "GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx"
        if not data_path.exists():
            logger.error("❌ Dataset not found. Please add it to backend/data/")
        else:
            try:
                result = subprocess.run(
                    [sys.executable, "train.py"],
                    capture_output=True,
                    text=True,
                    cwd=str(base_dir)
                )
                logger.info(result.stdout)
                if result.stderr:
                    logger.error("Errors: " + result.stderr)
                
                if greyc_model_path.exists():
                    logger.info("✅ GREYC model trained successfully!")
                else:
                    logger.error("❌ GREYC model training failed.")
                    
            except Exception as e:
                logger.error(f"❌ Training failed: {e}")
    
    # ============================================
    # 2. Check for Browser Model
    # ============================================
    browser_model_path = models_dir / "browser_model.pkl"
    browser_data_path = base_dir / "data" / "exported" / "browser_data.csv"
    
    if browser_model_path.exists():
        logger.info("✅ Browser model found (from Git LFS). Skipping training.")
    else:
        logger.info("🔧 Browser model not found. Checking for browser data...")
        
        if browser_data_path.exists():
            logger.info("📊 Browser data found! Training browser model...")
            try:
                result = subprocess.run(
                    [sys.executable, "train_browser_model.py"],
                    capture_output=True,
                    text=True,
                    cwd=str(base_dir)
                )
                logger.info(result.stdout)
                if result.stderr:
                    logger.error("Errors: " + result.stderr)
                
                if browser_model_path.exists():
                    logger.info("✅ Browser model trained successfully!")
                else:
                    logger.warning("⚠️ Browser model training failed or insufficient data.")
                    
            except Exception as e:
                logger.error(f"❌ Browser model training failed: {e}")
        else:
            logger.info("ℹ️ No browser data found. Skipping browser model training.")

    # ============================================
    # 3. Summary
    # ============================================
    logger.info("=" * 60)
    logger.info("MODEL STATUS")
    logger.info("=" * 60)
    
    if greyc_model_path.exists():
        file_size = greyc_model_path.stat().st_size / (1024 * 1024)
        logger.info(f"✅ GREYC model: {greyc_model_path} ({file_size:.1f} MB)")
    else:
        logger.info("❌ GREYC model: MISSING")
    
    if browser_model_path.exists():
        file_size = browser_model_path.stat().st_size / (1024 * 1024)
        logger.info(f"✅ Browser model: {browser_model_path} ({file_size:.1f} MB)")
    else:
        logger.info("ℹ️ Browser model: Not yet available (needs data)")

if __name__ == "__main__":
    train_model_if_not_exists()