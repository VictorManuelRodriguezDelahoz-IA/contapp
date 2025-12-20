"""
Save Excel structure to file for analysis
"""
import pandas as pd

excel_file = "../Finanzas Personales - 2026 (1).xlsx"

# Read ENERO sheet
df = pd.read_excel(excel_file, sheet_name='ENERO')

# Save to text file
with open('excel_structure.txt', 'w', encoding='utf-8') as f:
    f.write("EXCEL STRUCTURE ANALYSIS\n")
    f.write("="*80 + "\n\n")
    
    f.write(f"Columns: {df.columns.tolist()}\n\n")
    f.write(f"Shape: {df.shape}\n\n")
    
    f.write("First 15 rows:\n")
    f.write("="*80 + "\n")
    f.write(df.head(15).to_string())
    f.write("\n\n" + "="*80 + "\n")
    
    f.write("\nData types:\n")
    f.write(str(df.dtypes))
    
print("Excel structure saved to excel_structure.txt")
