"""
Import Excel summary data as transactions
The Excel file contains monthly summaries with category totals, not individual transactions.
We'll create one transaction per category per month.
"""
import pandas as pd
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(__file__))
from database import SessionLocal, Transaction, Category, init_db

# Month mapping
MONTH_MAP = {
    'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
    'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
    'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
}

# Category mapping from Excel to Database
CATEGORY_MAPPING = {
    'Ingresos': ('Salario', 'ingreso'),
    'Fijos': ('Vivienda', 'gasto'),
    'Variables': ('Otros Gastos', 'gasto'),
    'Ocio': ('Entretenimiento', 'gasto'),
    'Ahorro': ('Ahorro', 'gasto'),
    'Inversion': ('Inversiones', 'ingreso'),
}

def import_excel_summaries(excel_file, year=2026):
    """Import monthly summary data from Excel"""
    
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Get all categories
        categories = {cat.name: cat.id for cat in db.query(Category).all()}
        print(f"Available categories: {list(categories.keys())}\n")
        
        # Load Excel file
        xl = pd.ExcelFile(excel_file)
        total_imported = 0
        
        # Process each sheet (month)
        for sheet_name in xl.sheet_names:
            if sheet_name not in MONTH_MAP:
                print(f"Skipping sheet: {sheet_name}")
                continue
            
            month_num = MONTH_MAP[sheet_name]
            print(f"\n{'='*60}")
            print(f"Processing {sheet_name} (month {month_num})")
            print(f"{'='*60}")
            
            # Read sheet
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Look for category rows
            # The structure is: column 1 has category names, column 2 has values
            imported_count = 0
            
            for idx, row in df.iterrows():
                try:
                    # Get category name from column 1 (Unnamed: 1)
                    if 'Unnamed: 1' not in df.columns:
                        continue
                    
                    category_name = row['Unnamed: 1']
                    
                    # Skip if not a valid category
                    if pd.isna(category_name) or category_name not in CATEGORY_MAPPING:
                        continue
                    
                    # Get amount from column 2 (index 0)
                    amount_col = df.columns[2]  # Third column (index 0 or similar)
                    amount = row[amount_col]
                    
                    # Skip if no amount or zero
                    if pd.isna(amount) or amount == 0:
                        continue
                    
                    try:
                        amount = float(amount)
                    except:
                        continue
                    
                    if amount == 0:
                        continue
                    
                    # Map to database category
                    db_category_name, trans_type = CATEGORY_MAPPING[category_name]
                    category_id = categories.get(db_category_name)
                    
                    if not category_id:
                        print(f"⚠️  Category '{db_category_name}' not found in database")
                        continue
                    
                    # Create transaction date (first day of month)
                    trans_date = datetime(year, month_num, 1)
                    
                    # Check if transaction already exists
                    existing = db.query(Transaction).filter(
                        Transaction.description == f"{category_name} - {sheet_name} {year}",
                        Transaction.month == month_num,
                        Transaction.year == year
                    ).first()
                    
                    if existing:
                        print(f"  ⏭️  Skipping {category_name}: already exists")
                        continue
                    
                    # Create transaction
                    transaction = Transaction(
                        description=f"{category_name} - {sheet_name} {year}",
                        amount=abs(amount),
                        type=trans_type,
                        category_id=category_id,
                        date=trans_date,
                        month=month_num,
                        year=year,
                        notes=f"Importado desde Excel - {sheet_name}"
                    )
                    
                    db.add(transaction)
                    imported_count += 1
                    print(f"  ✅ {category_name}: ${amount:,.0f} ({trans_type})")
                    
                except Exception as e:
                    print(f"  ⚠️  Error processing row {idx}: {e}")
                    continue
            
            # Commit transactions for this month
            if imported_count > 0:
                db.commit()
                print(f"\n✅ Imported {imported_count} transactions from {sheet_name}")
                total_imported += imported_count
            else:
                print(f"\n⚠️  No transactions imported from {sheet_name}")
        
        print(f"\n{'='*60}")
        print(f"IMPORT SUMMARY")
        print(f"{'='*60}")
        print(f"Total transactions imported: {total_imported}")
        print(f"{'='*60}\n")
        
        # Show final database stats
        total_trans = db.query(Transaction).count()
        print(f"Total transactions in database: {total_trans}")
        
    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    excel_file = "../Finanzas Personales - 2026 (1).xlsx"
    import_excel_summaries(excel_file, year=2026)
