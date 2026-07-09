import os
from supabase import create_client, Client
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
        """Initialize the Supabase client"""
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SECRET_KEY")
        
        if not self.url or not self.key:
            logger.error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env")
            raise ValueError("Missing Supabase credentials")
        
        try:
            self._client = create_client(self.url, self.key)
            logger.info(f"Supabase client initialized with URL: {self.url}")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        return self._client

# Singleton instance
supabase_client = SupabaseClient().client