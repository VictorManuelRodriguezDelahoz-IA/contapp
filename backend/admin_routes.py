"""
Admin Routes for User Management
Only accessible by users with admin role
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List
from datetime import datetime

from .database import get_supabase_client
from .auth import require_admin
from .models import UserResponse, UserUpdate, UserCreate

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ============ USER MANAGEMENT ============
@router.post("/users", response_model=dict)
async def create_user(
    user_data: UserCreate,
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Create a new user (admin only)
    Creates user in Supabase Auth and profiles table
    """
    try:
        # Validate email doesn't already exist in profiles
        existing_profile = client.table('profiles')\
            .select('id')\
            .eq('email', user_data.email)\
            .execute()

        if existing_profile.data:
            raise HTTPException(
                status_code=400,
                detail=f"El email {user_data.email} ya está registrado"
            )

        # Create user in Supabase Auth
        print(f"Creating user with email: {user_data.email}")

        try:
            auth_response = client.auth.admin.create_user({
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": True  # Auto-confirm email
            })
        except Exception as auth_error:
            # Handle specific Supabase Auth errors
            error_message = str(auth_error)

            if "already been registered" in error_message.lower():
                raise HTTPException(
                    status_code=400,
                    detail=f"El email {user_data.email} ya está registrado en el sistema de autenticación"
                )
            elif "invalid email" in error_message.lower():
                raise HTTPException(
                    status_code=400,
                    detail="El formato del email no es válido"
                )
            elif "password" in error_message.lower():
                raise HTTPException(
                    status_code=400,
                    detail="La contraseña no cumple con los requisitos mínimos"
                )
            else:
                # Re-raise other auth errors
                raise HTTPException(
                    status_code=500,
                    detail=f"Error en el sistema de autenticación: {error_message}"
                )

        print(f"Auth response: {auth_response}")

        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=500,
                detail="Error creando usuario en Supabase Auth - respuesta vacía"
            )

        user_id = auth_response.user.id
        print(f"User created with ID: {user_id}")

        # Note: The trigger 'handle_new_user' automatically creates a profile
        # We just need to update it with the correct role and full_name
        import time
        time.sleep(0.5)  # Give the trigger time to execute

        # Update the auto-created profile with admin-specified data
        update_data = {
            'role': user_data.role,
            'is_active': True,
            'updated_at': datetime.utcnow().isoformat()
        }

        if user_data.full_name:
            update_data['full_name'] = user_data.full_name

        print(f"Updating auto-created profile with data: {update_data}")
        profile_response = client.table('profiles')\
            .update(update_data)\
            .eq('id', user_id)\
            .execute()

        print(f"Profile response: {profile_response}")

        if not profile_response.data:
            raise HTTPException(
                status_code=500,
                detail="Error actualizando perfil de usuario"
            )

        return {
            **profile_response.data[0],
            'message': f'Usuario {user_data.email} creado exitosamente',
            'temporary_password': user_data.password  # Return password so admin can share it
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error creando usuario: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")


@router.get("/users", response_model=List[dict])
async def get_all_users(
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Get all users in the system (admin only)
    Returns user profiles with statistics
    """
    try:
        # Get all profiles
        profiles_response = client.table('profiles')\
            .select('*')\
            .order('created_at', desc=True)\
            .execute()

        users = []
        for profile in profiles_response.data:
            # Get transaction count for each user
            transactions_response = client.table('transactions')\
                .select('id', count='exact')\
                .eq('user_id', profile['id'])\
                .execute()

            transaction_count = transactions_response.count if hasattr(transactions_response, 'count') else 0

            # Get last login from auth.users (if available)
            # Note: Supabase auth.users is not directly accessible via client
            # We'll use created_at as a fallback

            users.append({
                **profile,
                'transaction_count': transaction_count
            })

        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/users/{user_id}", response_model=dict)
async def get_user_details(
    user_id: str,
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Get detailed information about a specific user (admin only)
    """
    try:
        # Get profile
        profile_response = client.table('profiles')\
            .select('*')\
            .eq('id', user_id)\
            .single()\
            .execute()

        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        profile = profile_response.data

        # Get transaction statistics
        transactions_response = client.table('transactions')\
            .select('*')\
            .eq('user_id', user_id)\
            .execute()

        transactions = transactions_response.data
        total_income = sum(t['amount'] for t in transactions if t['type'] == 'ingreso')
        total_expenses = sum(t['amount'] for t in transactions if t['type'] == 'gasto')

        # Get budgets count
        budgets_response = client.table('budgets')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .execute()

        budgets_count = budgets_response.count if hasattr(budgets_response, 'count') else 0

        # Get savings goals count
        goals_response = client.table('savings_goals')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .execute()

        goals_count = goals_response.count if hasattr(goals_response, 'count') else 0

        return {
            **profile,
            'statistics': {
                'total_transactions': len(transactions),
                'total_income': total_income,
                'total_expenses': total_expenses,
                'balance': total_income - total_expenses,
                'budgets_count': budgets_count,
                'savings_goals_count': goals_count
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user details: {str(e)}")


@router.put("/users/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    update: UserUpdate,
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Update user profile (admin only)
    Can update: full_name, role, is_active, avatar_url
    """
    try:
        # Build update data
        update_data = {}

        if update.full_name is not None:
            update_data['full_name'] = update.full_name
        if update.role is not None:
            update_data['role'] = update.role
        if update.is_active is not None:
            update_data['is_active'] = update.is_active
        if update.avatar_url is not None:
            update_data['avatar_url'] = update.avatar_url

        update_data['updated_at'] = datetime.utcnow().isoformat()

        # Update profile
        response = client.table('profiles')\
            .update(update_data)\
            .eq('id', user_id)\
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


@router.put("/users/{user_id}/toggle-active", response_model=dict)
async def toggle_user_active(
    user_id: str,
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Toggle user active status (admin only)
    """
    try:
        # Prevent admin from deactivating themselves
        if user_id == admin_user['id']:
            raise HTTPException(
                status_code=400,
                detail="No puedes desactivar tu propia cuenta"
            )

        # Get current profile
        profile_response = client.table('profiles')\
            .select('is_active')\
            .eq('id', user_id)\
            .single()\
            .execute()

        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        current_status = profile_response.data['is_active']
        new_status = not current_status

        # Update status
        response = client.table('profiles')\
            .update({
                'is_active': new_status,
                'updated_at': datetime.utcnow().isoformat()
            })\
            .eq('id', user_id)\
            .execute()

        return {
            'user_id': user_id,
            'is_active': new_status,
            'message': f"Usuario {'activado' if new_status else 'desactivado'} exitosamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling user status: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Delete user and all their data (admin only)
    WARNING: This is irreversible
    Deletes user from both Supabase Auth and database
    """
    try:
        # Prevent admin from deleting themselves
        if user_id == admin_user['id']:
            raise HTTPException(
                status_code=400,
                detail="No puedes eliminar tu propia cuenta"
            )

        # Delete user's transactions
        client.table('transactions').delete().eq('user_id', user_id).execute()

        # Delete user's budgets
        client.table('budgets').delete().eq('user_id', user_id).execute()

        # Delete user's savings goals
        client.table('savings_goals').delete().eq('user_id', user_id).execute()

        # Delete profile
        client.table('profiles').delete().eq('id', user_id).execute()

        # Delete user from Supabase Auth
        try:
            client.auth.admin.delete_user(user_id)
            print(f"User {user_id} deleted from Supabase Auth")
        except Exception as auth_error:
            print(f"Warning: Could not delete user from Auth: {auth_error}")
            # Continue anyway since we already deleted the profile

        return {
            'message': 'Usuario y todos sus datos eliminados exitosamente',
            'user_id': user_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando usuario: {str(e)}")


@router.post("/cleanup-orphaned-users")
async def cleanup_orphaned_users(
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Find and clean up users that exist in Supabase Auth but not in profiles table
    This can happen if a user was deleted from profiles but not from Auth
    """
    try:
        # Get all profiles
        profiles = client.table('profiles').select('id, email').execute()
        profile_ids = {p['id'] for p in profiles.data}

        # List all auth users (this might not work with all Supabase versions)
        # This is a maintenance endpoint - use with caution

        return {
            'message': 'Para limpiar usuarios huérfanos, ve al dashboard de Supabase',
            'instructions': [
                '1. Ve a Authentication > Users en tu dashboard de Supabase',
                '2. Busca usuarios que no tengan perfil correspondiente',
                '3. Elimínalos manualmente',
                f'4. Usuarios con perfil activo: {len(profile_ids)}'
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/statistics", response_model=dict)
async def get_system_statistics(
    admin_user: dict = Depends(require_admin),
    client: Client = Depends(get_supabase_client)
):
    """
    Get system-wide statistics (admin only)
    """
    try:
        # Total users
        users_response = client.table('profiles').select('id', count='exact').execute()
        total_users = users_response.count if hasattr(users_response, 'count') else len(users_response.data)

        # Active users
        active_users_response = client.table('profiles')\
            .select('id', count='exact')\
            .eq('is_active', True)\
            .execute()
        active_users = active_users_response.count if hasattr(active_users_response, 'count') else len(active_users_response.data)

        # Users by role
        admins_response = client.table('profiles')\
            .select('id', count='exact')\
            .eq('role', 'admin')\
            .execute()
        admins_count = admins_response.count if hasattr(admins_response, 'count') else len(admins_response.data)

        full_users_response = client.table('profiles')\
            .select('id', count='exact')\
            .eq('role', 'full_user')\
            .execute()
        full_users_count = full_users_response.count if hasattr(full_users_response, 'count') else len(full_users_response.data)

        partial_users_response = client.table('profiles')\
            .select('id', count='exact')\
            .eq('role', 'partial_user')\
            .execute()
        partial_users_count = partial_users_response.count if hasattr(partial_users_response, 'count') else len(partial_users_response.data)

        # Total transactions
        transactions_response = client.table('transactions').select('id', count='exact').execute()
        total_transactions = transactions_response.count if hasattr(transactions_response, 'count') else len(transactions_response.data)

        # Total categories
        categories_response = client.table('categories').select('id', count='exact').execute()
        total_categories = categories_response.count if hasattr(categories_response, 'count') else len(categories_response.data)

        return {
            'users': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
                'by_role': {
                    'admin': admins_count,
                    'full_user': full_users_count,
                    'partial_user': partial_users_count
                }
            },
            'transactions': {
                'total': total_transactions
            },
            'categories': {
                'total': total_categories
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")
