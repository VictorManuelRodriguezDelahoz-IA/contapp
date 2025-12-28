"""
Database configuration using Supabase PostgreSQL
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Get the backend directory path
backend_dir = Path(__file__).parent

# Load environment variables from backend/.env
load_dotenv(dotenv_path=backend_dir / '.env')

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError(
        f"Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in {backend_dir}/.env file"
    )

# Create Supabase client with SERVICE_ROLE_KEY for backend operations
# This bypasses RLS policies for admin operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def get_supabase_client() -> Client:
    """
    Dependency to get Supabase client in FastAPI routes
    
    Usage:
        @router.get("/endpoint")
        async def my_endpoint(client: Client = Depends(get_supabase_client)):
            response = client.table('table_name').select('*').execute()
    """
    return supabase
