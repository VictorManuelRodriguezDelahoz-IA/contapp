from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime

from database import get_db, Transaction, Category, Budget, SavingsGoal
from auth import get_current_user
from models import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    CategoryResponse, BudgetCreate, BudgetResponse,
    SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse,
    FinancialSummary, CategorySummary, MonthlySummary
)

router = APIRouter(prefix="/api/financial", tags=["financial"])


# ============ CATEGORIES ============
@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(
    type: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all categories, optionally filtered by type"""
    query = db.query(Category)
    if type:
        query = query.filter(Category.type == type)
    return query.all()


# ============ TRANSACTIONS ============
@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new transaction"""
    # Debug logging
    print(f"=== CREATE TRANSACTION DEBUG ===")
    print(f"Received data: {transaction}")
    print(f"Date field: {transaction.date}")
    print(f"Date type: {type(transaction.date)}")
    
    # Get category
    category = db.query(Category).filter(Category.id == transaction.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Parse date from string
    if transaction.date:
        # Parse ISO date string (YYYY-MM-DD)
        try:
            # Handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:MM:SS' formats
            date_str = transaction.date.split('T')[0]  # Get just the date part
            trans_date = datetime.strptime(date_str, '%Y-%m-%d')
            print(f"Parsed date: {trans_date}")
            print(f"Month: {trans_date.month}, Year: {trans_date.year}")
        except (ValueError, AttributeError) as e:
            # If parsing fails, use current date
            print(f"Date parsing error: {e}, using current date")
            trans_date = datetime.utcnow()
    else:
        print("No date provided, using current date")
        trans_date = datetime.utcnow()
    
    # Create transaction
    db_transaction = Transaction(
        description=transaction.description,
        amount=transaction.amount,
        type=transaction.type,
        category_id=transaction.category_id,
        date=trans_date,
        month=trans_date.month,
        year=trans_date.year,
        notes=transaction.notes
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # Return with category info
    return TransactionResponse(
        id=db_transaction.id,
        description=db_transaction.description,
        amount=db_transaction.amount,
        type=db_transaction.type,
        category_id=db_transaction.category_id,
        category_name=category.name,
        category_color=category.color,
        category_icon=category.icon,
        date=db_transaction.date,
        month=db_transaction.month,
        year=db_transaction.year,
        notes=db_transaction.notes,
        created_at=db_transaction.created_at
    )


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    month: int = None,
    year: int = None,
    type: str = None,
    category_id: int = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get transactions with optional filters"""
    query = db.query(Transaction)
    
    if month:
        query = query.filter(Transaction.month == month)
    if year:
        query = query.filter(Transaction.year == year)
    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    transactions = query.order_by(Transaction.date.desc()).limit(limit).all()
    
    # Build response with category info
    result = []
    for trans in transactions:
        category = db.query(Category).filter(Category.id == trans.category_id).first()
        result.append(TransactionResponse(
            id=trans.id,
            description=trans.description,
            amount=trans.amount,
            type=trans.type,
            category_id=trans.category_id,
            category_name=category.name if category else "Sin categoría",
            category_color=category.color if category else "#gray",
            category_icon=category.icon if category else "💰",
            date=trans.date,
            month=trans.month,
            year=trans.year,
            notes=trans.notes,
            created_at=trans.created_at
        ))
    
    return result


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a transaction"""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    # Update fields
    if transaction.description is not None:
        db_transaction.description = transaction.description
    if transaction.amount is not None:
        db_transaction.amount = transaction.amount
    if transaction.type is not None:
        db_transaction.type = transaction.type
    if transaction.category_id is not None:
        db_transaction.category_id = transaction.category_id
    if transaction.date is not None:
        # Parse date string to datetime
        try:
            date_str = transaction.date.split('T')[0]  # Get just the date part
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
            db_transaction.date = parsed_date
            db_transaction.month = parsed_date.month
            db_transaction.year = parsed_date.year
        except (ValueError, AttributeError) as e:
            print(f"Date parsing error in update: {e}")
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
    if transaction.notes is not None:
        db_transaction.notes = transaction.notes
    
    db.commit()
    db.refresh(db_transaction)
    
    # Get category
    category = db.query(Category).filter(Category.id == db_transaction.category_id).first()
    
    return TransactionResponse(
        id=db_transaction.id,
        description=db_transaction.description,
        amount=db_transaction.amount,
        type=db_transaction.type,
        category_id=db_transaction.category_id,
        category_name=category.name if category else "Sin categoría",
        category_color=category.color if category else "#gray",
        category_icon=category.icon if category else "💰",
        date=db_transaction.date,
        month=db_transaction.month,
        year=db_transaction.year,
        notes=db_transaction.notes,
        created_at=db_transaction.created_at
    )


@router.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a transaction"""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    db.delete(db_transaction)
    db.commit()
    
    return {"message": "Transacción eliminada exitosamente"}


# ============ SUMMARIES ============
@router.get("/summary", response_model=FinancialSummary)
def get_financial_summary(
    month: int = None,
    year: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get financial summary with income/expense breakdown by category"""
    query = db.query(Transaction)
    
    if month:
        query = query.filter(Transaction.month == month)
    if year:
        query = query.filter(Transaction.year == year)
    
    transactions = query.all()
    
    # Calculate totals
    total_income = sum(t.amount for t in transactions if t.type == "ingreso")
    total_expenses = sum(t.amount for t in transactions if t.type == "gasto")
    balance = total_income - total_expenses
    
    # Group by category for expenses
    expense_by_cat = {}
    for trans in transactions:
        if trans.type == "gasto":
            cat = db.query(Category).filter(Category.id == trans.category_id).first()
            if cat:
                if cat.name not in expense_by_cat:
                    expense_by_cat[cat.name] = {
                        "total": 0,
                        "color": cat.color,
                        "icon": cat.icon
                    }
                expense_by_cat[cat.name]["total"] += trans.amount
    
    # Group by category for income
    income_by_cat = {}
    for trans in transactions:
        if trans.type == "ingreso":
            cat = db.query(Category).filter(Category.id == trans.category_id).first()
            if cat:
                if cat.name not in income_by_cat:
                    income_by_cat[cat.name] = {
                        "total": 0,
                        "color": cat.color,
                        "icon": cat.icon
                    }
                income_by_cat[cat.name]["total"] += trans.amount
    
    # Build category summaries
    expense_summaries = [
        CategorySummary(
            category_name=name,
            category_color=data["color"],
            category_icon=data["icon"],
            total=data["total"],
            percentage=(data["total"] / total_expenses * 100) if total_expenses > 0 else 0
        )
        for name, data in expense_by_cat.items()
    ]
    
    income_summaries = [
        CategorySummary(
            category_name=name,
            category_color=data["color"],
            category_icon=data["icon"],
            total=data["total"],
            percentage=(data["total"] / total_income * 100) if total_income > 0 else 0
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


@router.get("/summary/monthly", response_model=List[MonthlySummary])
def get_monthly_summaries(
    year: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get monthly summaries for a year"""
    summaries = []
    
    for month in range(1, 13):
        transactions = db.query(Transaction).filter(
            Transaction.month == month,
            Transaction.year == year
        ).all()
        
        total_income = sum(t.amount for t in transactions if t.type == "ingreso")
        total_expenses = sum(t.amount for t in transactions if t.type == "gasto")
        
        # Find top expense category
        expense_by_cat = {}
        for trans in transactions:
            if trans.type == "gasto":
                cat = db.query(Category).filter(Category.id == trans.category_id).first()
                if cat:
                    expense_by_cat[cat.name] = expense_by_cat.get(cat.name, 0) + trans.amount
        
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


# ============ BUDGETS ============
@router.post("/budgets", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a budget for a category"""
    # Check if budget already exists
    existing = db.query(Budget).filter(
        Budget.category_id == budget.category_id,
        Budget.month == budget.month,
        Budget.year == budget.year
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un presupuesto para esta categoría en este mes")
    
    db_budget = Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    # Get category and spent amount
    category = db.query(Category).filter(Category.id == budget.category_id).first()
    spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.category_id == budget.category_id,
        Transaction.month == budget.month,
        Transaction.year == budget.year,
        Transaction.type == "gasto"
    ).scalar() or 0
    
    return BudgetResponse(
        id=db_budget.id,
        category_id=db_budget.category_id,
        category_name=category.name if category else "Sin categoría",
        amount=db_budget.amount,
        month=db_budget.month,
        year=db_budget.year,
        spent=spent
    )


@router.get("/budgets", response_model=List[BudgetResponse])
def get_budgets(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get budgets for a specific month"""
    budgets = db.query(Budget).filter(
        Budget.month == month,
        Budget.year == year
    ).all()
    
    result = []
    for budget in budgets:
        category = db.query(Category).filter(Category.id == budget.category_id).first()
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.category_id == budget.category_id,
            Transaction.month == month,
            Transaction.year == year,
            Transaction.type == "gasto"
        ).scalar() or 0
        
        result.append(BudgetResponse(
            id=budget.id,
            category_id=budget.category_id,
            category_name=category.name if category else "Sin categoría",
            amount=budget.amount,
            month=budget.month,
            year=budget.year,
            spent=spent
        ))
    
    return result


# ============ SAVINGS GOALS ============
@router.post("/savings-goals", response_model=SavingsGoalResponse)
def create_savings_goal(
    goal: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a savings goal"""
    db_goal = SavingsGoal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return SavingsGoalResponse(
        id=db_goal.id,
        name=db_goal.name,
        target_amount=db_goal.target_amount,
        current_amount=db_goal.current_amount,
        deadline=db_goal.deadline,
        created_at=db_goal.created_at,
        completed=db_goal.completed,
        progress_percentage=(db_goal.current_amount / db_goal.target_amount * 100) if db_goal.target_amount > 0 else 0
    )


@router.get("/savings-goals", response_model=List[SavingsGoalResponse])
def get_savings_goals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all savings goals"""
    goals = db.query(SavingsGoal).all()
    
    return [
        SavingsGoalResponse(
            id=goal.id,
            name=goal.name,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            deadline=goal.deadline,
            created_at=goal.created_at,
            completed=goal.completed,
            progress_percentage=(goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
        )
        for goal in goals
    ]


@router.put("/savings-goals/{goal_id}", response_model=SavingsGoalResponse)
def update_savings_goal(
    goal_id: int,
    update: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update savings goal progress"""
    db_goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")
    
    db_goal.current_amount = update.current_amount
    
    # Check if completed
    if db_goal.current_amount >= db_goal.target_amount:
        db_goal.completed = True
    
    db.commit()
    db.refresh(db_goal)
    
    return SavingsGoalResponse(
        id=db_goal.id,
        name=db_goal.name,
        target_amount=db_goal.target_amount,
        current_amount=db_goal.current_amount,
        deadline=db_goal.deadline,
        created_at=db_goal.created_at,
        completed=db_goal.completed,
        progress_percentage=(db_goal.current_amount / db_goal.target_amount * 100) if db_goal.target_amount > 0 else 0
    )
