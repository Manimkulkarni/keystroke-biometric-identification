import os
from dotenv import load_dotenv
from utils.logger import logger

# Load environment variables
load_dotenv()

class SupabaseClient:
    """Singleton Supabase client for database operations"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the Supabase client (optional — skipped if credentials are missing)"""
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SECRET_KEY")
        
        if not self.url or not self.key:
            logger.warning("SUPABASE_URL / SUPABASE_SECRET_KEY not set — data collection disabled")
            self._client = None
            return
        
        try:
            from supabase import create_client
            self._client = create_client(self.url, self.key)
            logger.info(f"Supabase client initialized with URL: {self.url}")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self._client = None
    
    @property
    def client(self):
        """Get the Supabase client instance (may be None if unconfigured)"""
        return self._client

# Singleton instance — may be None when Supabase is not configured
supabase_client = SupabaseClient().client
