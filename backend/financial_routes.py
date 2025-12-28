"""
Financial Routes using Supabase
All CRUD operations for transactions, categories, budgets, and savings goals
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List
from datetime import datetime

from .database import get_supabase_client
from .auth import get_current_user, require_admin
from .models import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    CategoryResponse, BudgetCreate, BudgetResponse,
    SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse,
    FinancialSummary, CategorySummary, MonthlySummary
)

router = APIRouter(prefix="/api/financial", tags=["financial"])


# ============ CATEGORIES ============
@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    type: str = None,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Get all categories, optionally filtered by type"""
    try:
        query = client.table('categories').select('*')
        
        if type:
            query = query.eq('type', type)
        
        response = query.order('name').execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")


# ============ TRANSACTIONS ============
@router.post("/transactions", response_model=dict)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Create a new transaction"""
    try:
        # Parse date
        if transaction.date:
            date_str = transaction.date.split('T')[0]
            trans_date = datetime.strptime(date_str, '%Y-%m-%d')
        else:
            trans_date = datetime.utcnow()
        
        # Prepare transaction data
        transaction_data = {
            'user_id': current_user['id'],
            'description': transaction.description,
            'amount': transaction.amount,
            'type': transaction.type,
            'category_id': transaction.category_id,
            'date': trans_date.isoformat(),
            'month': trans_date.month,
            'year': trans_date.year,
            'notes': transaction.notes
        }
        
        # Insert transaction
        response = client.table('transactions').insert(transaction_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Error creating transaction")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating transaction: {str(e)}")


@router.get("/transactions", response_model=List[dict])
async def get_transactions(
    month: int = None,
    year: int = None,
    type: str = None,
    category_id: int = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Get transactions with optional filters"""
    try:
        # Build query with JOIN to categories
        query = client.table('transactions')\
            .select('*, categories(*)')\
            .eq('user_id', current_user['id'])
        
        if month:
            query = query.eq('month', month)
        if year:
            query = query.eq('year', year)
        if type:
            query = query.eq('type', type)
        if category_id:
            query = query.eq('category_id', category_id)
        
        response = query.order('date', desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")


@router.put("/transactions/{transaction_id}", response_model=dict)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Update a transaction"""
    try:
        # Build update data
        update_data = {}
        
        if transaction.description is not None:
            update_data['description'] = transaction.description
        if transaction.amount is not None:
            update_data['amount'] = transaction.amount
        if transaction.type is not None:
            update_data['type'] = transaction.type
        if transaction.category_id is not None:
            update_data['category_id'] = transaction.category_id
        if transaction.date is not None:
            date_str = transaction.date.split('T')[0]
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
            update_data['date'] = parsed_date.isoformat()
            update_data['month'] = parsed_date.month
            update_data['year'] = parsed_date.year
        if transaction.notes is not None:
            update_data['notes'] = transaction.notes
        
        # Update transaction (RLS ensures user can only update their own)
        response = client.table('transactions')\
            .update(update_data)\
            .eq('id', transaction_id)\
            .eq('user_id', current_user['id'])\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Transaction not found or not authorized")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating transaction: {str(e)}")


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Delete a transaction"""
    try:
        response = client.table('transactions')\
            .delete()\
            .eq('id', transaction_id)\
            .eq('user_id', current_user['id'])\
            .execute()
        
        return {"message": "Transacción eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting transaction: {str(e)}")


# ============ SUMMARIES ============
@router.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(
    month: int = None,
    year: int = None,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Get financial summary with income/expense breakdown by category"""
    try:
        # Build query
        query = client.table('transactions')\
            .select('*, categories(*)')\
            .eq('user_id', current_user['id'])
        
        if month:
            query = query.eq('month', month)
        if year:
            query = query.eq('year', year)
        
        response = query.execute()
        transactions = response.data
        
        # Calculate totals
        total_income = sum(t['amount'] for t in transactions if t['type'] == 'ingreso')
        total_expenses = sum(t['amount'] for t in transactions if t['type'] == 'gasto')
        balance = total_income - total_expenses
        
        # Group by category for expenses
        expense_by_cat = {}
        for trans in transactions:
            if trans['type'] == 'gasto' and trans.get('categories'):
                cat = trans['categories']
                cat_name = cat['name']
                if cat_name not in expense_by_cat:
                    expense_by_cat[cat_name] = {
                        'total': 0,
                        'color': cat.get('color', '#6366f1'),
                        'icon': cat.get('icon', '💰')
                    }
                expense_by_cat[cat_name]['total'] += trans['amount']
        
        # Group by category for income
        income_by_cat = {}
        for trans in transactions:
            if trans['type'] == 'ingreso' and trans.get('categories'):
                cat = trans['categories']
                cat_name = cat['name']
                if cat_name not in income_by_cat:
                    income_by_cat[cat_name] = {
                        'total': 0,
                        'color': cat.get('color', '#6366f1'),
                        'icon': cat.get('icon', '💰')
                    }
                income_by_cat[cat_name]['total'] += trans['amount']
        
        # Build category summaries
        expense_summaries = [
            CategorySummary(
                category_name=name,
                category_color=data['color'],
                category_icon=data['icon'],
                total=data['total'],
                percentage=(data['total'] / total_expenses * 100) if total_expenses > 0 else 0
            )
            for name, data in expense_by_cat.items()
        ]
        
        income_summaries = [
            CategorySummary(
                category_name=name,
                category_color=data['color'],
                category_icon=data['icon'],
                total=data['total'],
                percentage=(data['total'] / total_income * 100) if total_income > 0 else 0
            )
            for name, data in income_by_cat.items()
        ]
        
        return FinancialSummary(
            total_income=total_income,
            total_expenses=total_expenses,
            balance=balance,
            expense_by_category=expense_summaries,
            income_by_category=income_summaries
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


@router.get("/summary/monthly", response_model=List[MonthlySummary])
async def get_monthly_summaries(
    year: int,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Get monthly summaries for a year"""
    try:
        summaries = []
        
        for month in range(1, 13):
            # Get transactions for this month
            response = client.table('transactions')\
                .select('*, categories(name)')\
                .eq('user_id', current_user['id'])\
                .eq('month', month)\
                .eq('year', year)\
                .execute()
            
            transactions = response.data
            
            total_income = sum(t['amount'] for t in transactions if t['type'] == 'ingreso')
            total_expenses = sum(t['amount'] for t in transactions if t['type'] == 'gasto')
            
            # Find top expense category
            expense_by_cat = {}
            for trans in transactions:
                if trans['type'] == 'gasto' and trans.get('categories'):
                    cat_name = trans['categories']['name']
                    expense_by_cat[cat_name] = expense_by_cat.get(cat_name, 0) + trans['amount']
            
            top_category = max(expense_by_cat.items(), key=lambda x: x[1])[0] if expense_by_cat else None
            
            summaries.append(MonthlySummary(
                month=month,
                year=year,
                total_income=total_income,
                total_expenses=total_expenses,
                balance=total_income - total_expenses,
                top_expense_category=top_category
            ))
        
        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating monthly summaries: {str(e)}")


# ============ BUDGETS ============
@router.post("/budgets", response_model=dict)
async def create_budget(
    budget: BudgetCreate,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Create a budget for a category"""
    try:
        # Check if budget already exists
        existing = client.table('budgets')\
            .select('*')\
            .eq('user_id', current_user['id'])\
            .eq('category_id', budget.category_id)\
            .eq('month', budget.month)\
            .eq('year', budget.year)\
            .execute()
        
        if existing.data:
            raise HTTPException(
                status_code=400, 
                detail="Ya existe un presupuesto para esta categoría en este mes"
            )
        
        # Create budget
        budget_data = {
            'user_id': current_user['id'],
            'category_id': budget.category_id,
            'amount': budget.amount,
            'month': budget.month,
            'year': budget.year
        }
        
        response = client.table('budgets').insert(budget_data).execute()
        return response.data[0] if response.data else {}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating budget: {str(e)}")


@router.get("/budgets", response_model=List[dict])
async def get_budgets(
    month: int,
    year: int,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Get budgets for a specific month"""
    try:
        response = client.table('budgets')\
            .select('*, categories(*)')\
            .eq('user_id', current_user['id'])\
            .eq('month', month)\
            .eq('year', year)\
            .execute()
        
        budgets = response.data
        
        # For each budget, calculate spent amount
        result = []
        for budget in budgets:
            spent_response = client.table('transactions')\
                .select('amount')\
                .eq('user_id', current_user['id'])\
                .eq('category_id', budget['category_id'])\
                .eq('month', month)\
                .eq('year', year)\
                .eq('type', 'gasto')\
                .execute()
            
            spent = sum(t['amount'] for t in spent_response.data) if spent_response.data else 0
            
            budget['spent'] = spent
            result.append(budget)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching budgets: {str(e)}")


# ============ SAVINGS GOALS ============
@router.post("/savings-goals", response_model=dict)
async def create_savings_goal(
    goal: SavingsGoalCreate,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Create a savings goal"""
    try:
        goal_data = {
            'user_id': current_user['id'],
            'name': goal.name,
            'target_amount': goal.target_amount,
            'current_amount': 0,
            'deadline': goal.deadline.isoformat() if goal.deadline else None
        }
        
        response = client.table('savings_goals').insert(goal_data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating savings goal: {str(e)}")


@router.get("/savings-goals", response_model=List[dict])
async def get_savings_goals(
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Get all savings goals"""
    try:
        response = client.table('savings_goals')\
            .select('*')\
            .eq('user_id', current_user['id'])\
            .execute()
        
        # Add progress percentage to each goal
        goals = []
        for goal in response.data:
            goal['progress_percentage'] = (
                (goal['current_amount'] / goal['target_amount'] * 100) 
                if goal['target_amount'] > 0 else 0
            )
            goals.append(goal)
        
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching savings goals: {str(e)}")


@router.put("/savings-goals/{goal_id}", response_model=dict)
async def update_savings_goal(
    goal_id: int,
    update: SavingsGoalUpdate,
    current_user: dict = Depends(get_current_user),
    client: Client = Depends(get_supabase_client)
):
    """Update savings goal progress"""
    try:
        # Get current goal
        goal_response = client.table('savings_goals')\
            .select('*')\
            .eq('id', goal_id)\
            .eq('user_id', current_user['id'])\
            .single()\
            .execute()
        
        if not goal_response.data:
            raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")
        
        goal = goal_response.data
        
        # Check if completed
        completed = update.current_amount >= goal['target_amount']
        
        # Update goal
        update_data = {
            'current_amount': update.current_amount,
            'completed': completed
        }
        
        response = client.table('savings_goals')\
            .update(update_data)\
            .eq('id', goal_id)\
            .eq('user_id', current_user['id'])\
            .execute()
        
        return response.data[0] if response.data else {}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating savings goal: {str(e)}")
