from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

# SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./finanzas.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TransactionType(str, enum.Enum):
    INGRESO = "ingreso"
    GASTO = "gasto"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    access_code = Column(String, unique=True, index=True)
    name = Column(String, default="Usuario")
    created_at = Column(DateTime, default=datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String)  # "ingreso" or "gasto"
    color = Column(String, default="#6366f1")
    icon = Column(String, default="💰")
    
    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    amount = Column(Float)
    type = Column(String)  # "ingreso" or "gasto"
    category_id = Column(Integer, ForeignKey("categories.id"))
    date = Column(DateTime, default=datetime.utcnow)
    month = Column(Integer)  # 1-12
    year = Column(Integer)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("Category", back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    amount = Column(Float)
    month = Column(Integer)  # 1-12
    year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category = relationship("Category")


class SavingsGoal(Base):
    __tablename__ = "savings_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)


def init_db():
    """Initialize database and create default categories"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if categories already exist
    if db.query(Category).count() == 0:
        # Default income categories
        income_categories = [
            Category(name="Salario", type="ingreso", color="#10b981", icon="💼"),
            Category(name="Freelance", type="ingreso", color="#059669", icon="💻"),
            Category(name="Inversiones", type="ingreso", color="#34d399", icon="📈"),
            Category(name="Otros Ingresos", type="ingreso", color="#6ee7b7", icon="💵"),
        ]
        
        # Default expense categories
        expense_categories = [
            Category(name="Alimentación", type="gasto", color="#ef4444", icon="🍔"),
            Category(name="Transporte", type="gasto", color="#f97316", icon="🚗"),
            Category(name="Vivienda", type="gasto", color="#f59e0b", icon="🏠"),
            Category(name="Servicios", type="gasto", color="#eab308", icon="💡"),
            Category(name="Salud", type="gasto", color="#ec4899", icon="🏥"),
            Category(name="Educación", type="gasto", color="#8b5cf6", icon="📚"),
            Category(name="Entretenimiento", type="gasto", color="#6366f1", icon="🎮"),
            Category(name="Ropa", type="gasto", color="#06b6d4", icon="👕"),
            Category(name="Ahorro", type="gasto", color="#14b8a6", icon="🏦"),
            Category(name="Otros Gastos", type="gasto", color="#64748b", icon="💸"),
        ]
        
        db.add_all(income_categories + expense_categories)
        db.commit()
    
    # Create default user if doesn't exist
    if db.query(User).count() == 0:
        default_user = User(access_code="FINANZAS2026", name="Usuario")
        db.add(default_user)
        db.commit()
    
    db.close()
