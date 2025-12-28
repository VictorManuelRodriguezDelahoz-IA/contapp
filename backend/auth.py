"""
Authentication module using Supabase Auth
Validates JWT tokens from Supabase and extracts user information
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from .database import get_supabase_client

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    client: Client = Depends(get_supabase_client)
):
    """
    Validate Supabase JWT token and return user information
    
    This function:
    1. Extracts the JWT token from the Authorization header
    2. Validates the token with Supabase
    3. Returns the authenticated user's information
    
    Returns:
        dict: User information including id, email, role, etc.
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Get user from Supabase using the token
        # This validates the token and returns user info
        user_response = client.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise credentials_exception
        
        user = user_response.user
        
        # Get user profile from profiles table
        profile_response = client.table('profiles')\
            .select('*')\
            .eq('id', user.id)\
            .single()\
            .execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil de usuario no encontrado"
            )
        
        profile = profile_response.data
        
        # Check if user is active
        if not profile.get('is_active', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cuenta desactivada. Contacta al administrador."
            )
        
        # Check if user has accepted terms
        if not profile.get('terms_accepted_at'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Debes aceptar los términos y condiciones"
            )
        
        # Return combined user info
        return {
            "id": user.id,
            "email": user.email,
            "profile": profile,
            "role": profile.get('role', 'full_user'),
            "is_admin": profile.get('role') == 'admin',
            "is_active": profile.get('is_active', False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating token: {e}")
        raise credentials_exception


async def require_admin(current_user: dict = Depends(get_current_user)):
    """
    Dependency to require admin role
    
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(user = Depends(require_admin)):
            # Only admins can access this
    """
    if not current_user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador"
        )
    return current_user
