"""
Simplified Excel import script - directly import visible Excel data
"""
import pandas as pd
import sys
import os
from datetime import datetime
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.dirname(__file__))
from database import SessionLocal, Transaction, Category, init_db

# Initialize database
init_db()
db = SessionLocal()

try:
    # Load Excel file
    excel_file = "../Finanzas Personales - 2026 (1).xlsx"
    
    # Get all categories from database
    categories = {cat.name: cat.id for cat in db.query(Category).all()}
    print(f"Available categories: {list(categories.keys())}\n")
    
    # Read ENERO sheet to understand structure
    print("Reading ENERO sheet...")
    df = pd.read_excel(excel_file, sheet_name='ENERO')
    
    print(f"Columns found: {df.columns.tolist()}")
    print(f"Shape: {df.shape}")
    print(f"\nFirst 5 rows:")
    print(df.head())
    
    print("\n" + "="*80)
    print("Please review the Excel structure above.")
    print("The script needs to be updated with the correct column names.")
    print("="*80)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
