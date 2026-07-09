import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def test_connection():
    """Test Supabase connection"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env")
        return
    
    try:
        client = create_client(url, key)
        
        # Test query
        response = client.table("keystrokes").select("*", count="exact").limit(1).execute()
        
        print(f"✅ Supabase connection successful!")
        print(f"   URL: {url}")
        print(f"   Total samples: {response.count}")
        
        if response.data:
            print(f"   Latest sample: {response.data[0]}")
        else:
            print("   No samples found yet.")
            
    except Exception as e:
        print(f"❌ Failed to connect: {e}")

if __name__ == "__main__":
    test_connection()