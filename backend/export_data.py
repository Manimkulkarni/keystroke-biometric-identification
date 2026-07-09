import os
import json
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from supabase import create_client
from pathlib import Path

load_dotenv()

def export_browser_data():
    """Export all browser-collected data from Supabase"""
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return None
    
    try:
        client = create_client(url, key)
        
        # Fetch all browser samples
        response = client.table("keystrokes").select("*").eq("source", "browser").execute()
        
        if not response.data:
            print("❌ No browser data found")
            print("   Run the Typing Experiment first!")
            return None
        
        print(f"✅ Found {len(response.data)} browser samples")
        
        # Parse data
        data = []
        for row in response.data:
            features = json.loads(row["features"])
            data.append({
                "user_id": row["user_id"],
                "features": features,
                "style": row.get("style", "normal"),
                "phrase": row.get("phrase", ""),
                "typing_speed": row.get("typing_speed"),
                "hold_time_avg": row.get("hold_time_avg"),
                "flight_time_avg": row.get("flight_time_avg"),
                "browser": row.get("browser"),
                "os": row.get("os"),
                "quality_score": row.get("quality_score", 100),
                "is_valid": row.get("is_valid", True)
            })
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Split features into columns
        feature_df = pd.DataFrame(df["features"].tolist())
        feature_df.columns = [f"F{i+1}" for i in range(feature_df.shape[1])]
        
        # Combine
        final_df = pd.concat([
            df[["user_id", "style", "phrase", "typing_speed", "hold_time_avg", 
                "flight_time_avg", "browser", "os", "quality_score", "is_valid"]],
            feature_df
        ], axis=1)
        
        # Save
        output_dir = Path("data/exported")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        final_df.to_csv(output_dir / "browser_data.csv", index=False)
        print(f"✅ Saved to data/exported/browser_data.csv")
        
        # Print summary
        print(f"\n📊 Dataset Summary:")
        print(f"   Total samples: {len(final_df)}")
        print(f"   Unique users: {final_df['user_id'].nunique()}")
        print(f"   Styles: {final_df['style'].unique().tolist()}")
        print(f"   Avg quality score: {final_df['quality_score'].mean():.1f}%")
        
        return final_df
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    export_browser_data()