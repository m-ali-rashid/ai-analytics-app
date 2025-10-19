#!/usr/bin/env python3
"""
Simple Excel File Generator using only built-in Python libraries
Creates .xlsx files by generating the XML structure manually
"""

import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
import random
import os

class SimpleExcelWriter:
    def __init__(self, filename):
        self.filename = filename
        self.sheets = []
    
    def add_sheet(self, name, headers, rows):
        """Add a worksheet with headers and data rows"""
        self.sheets.append({
            'name': name,
            'headers': headers,
            'rows': rows
        })
    
    def save(self):
        """Save the Excel file"""
        # Create temporary directory structure
        temp_dir = f"{self.filename}_temp"
        os.makedirs(temp_dir, exist_ok=True)
        os.makedirs(f"{temp_dir}/_rels", exist_ok=True)
        os.makedirs(f"{temp_dir}/xl", exist_ok=True)
        os.makedirs(f"{temp_dir}/xl/_rels", exist_ok=True)
        os.makedirs(f"{temp_dir}/xl/worksheets", exist_ok=True)
        
        # Create [Content_Types].xml
        self._create_content_types(temp_dir)
        
        # Create _rels/.rels
        self._create_main_rels(temp_dir)
        
        # Create xl/workbook.xml
        self._create_workbook(temp_dir)
        
        # Create xl/_rels/workbook.xml.rels
        self._create_workbook_rels(temp_dir)
        
        # Create worksheets
        for i, sheet in enumerate(self.sheets):
            self._create_worksheet(temp_dir, i + 1, sheet)
        
        # Create ZIP file
        with zipfile.ZipFile(self.filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_path = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arc_path)
        
        # Clean up temp directory
        import shutil
        shutil.rmtree(temp_dir)
    
    def _create_content_types(self, temp_dir):
        content = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>'''
        with open(f"{temp_dir}/[Content_Types].xml", 'w') as f:
            f.write(content)
    
    def _create_main_rels(self, temp_dir):
        content = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'''
        with open(f"{temp_dir}/_rels/.rels", 'w') as f:
            f.write(content)
    
    def _create_workbook(self, temp_dir):
        content = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="Sheet1" sheetId="1" r:id="rId1"/>
</sheets>
</workbook>'''
        with open(f"{temp_dir}/xl/workbook.xml", 'w') as f:
            f.write(content)
    
    def _create_workbook_rels(self, temp_dir):
        content = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>'''
        with open(f"{temp_dir}/xl/_rels/workbook.xml.rels", 'w') as f:
            f.write(content)
    
    def _create_worksheet(self, temp_dir, sheet_num, sheet_data):
        # Start worksheet XML
        content = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>'''
        
        # Add headers
        content += f'<row r="1">'
        for col_idx, header in enumerate(sheet_data['headers']):
            col_letter = chr(65 + col_idx)  # A, B, C, etc.
            content += f'<c r="{col_letter}1" t="inlineStr"><is><t>{self._escape_xml(str(header))}</t></is></c>'
        content += '</row>'
        
        # Add data rows
        for row_idx, row in enumerate(sheet_data['rows']):
            row_num = row_idx + 2  # Start from row 2 (after headers)
            content += f'<row r="{row_num}">'
            for col_idx, cell_value in enumerate(row):
                col_letter = chr(65 + col_idx)
                if isinstance(cell_value, (int, float)):
                    content += f'<c r="{col_letter}{row_num}"><v>{cell_value}</v></c>'
                else:
                    content += f'<c r="{col_letter}{row_num}" t="inlineStr"><is><t>{self._escape_xml(str(cell_value))}</t></is></c>'
            content += '</row>'
        
        content += '''</sheetData>
</worksheet>'''
        
        with open(f"{temp_dir}/xl/worksheets/sheet{sheet_num}.xml", 'w') as f:
            f.write(content)
    
    def _escape_xml(self, text):
        """Escape XML special characters"""
        return str(text).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')

def generate_sample_excel_files():
    """Generate sample Excel files for testing"""
    
    # 1. Financial Data
    print("📊 Generating financial data Excel file...")
    symbols = ["AAPL", "TSLA", "GOOG", "MSFT", "AMZN", "META"]
    financial_data = []
    
    for i in range(100):
        date = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        symbol = random.choice(symbols)
        price = round(random.uniform(100, 400), 2)
        volume = random.randint(1000000, 50000000)
        sentiment = round(random.uniform(0.3, 0.95), 2)
        financial_data.append([date, symbol, price, volume, sentiment])
    
    excel_writer = SimpleExcelWriter("sample_financial_data.xlsx")
    excel_writer.add_sheet("Financial Data", 
                          ["Date", "Symbol", "Price", "Volume", "Sentiment"], 
                          financial_data)
    excel_writer.save()
    print("✅ sample_financial_data.xlsx created!")
    
    # 2. Sales Data
    print("📈 Generating sales data Excel file...")
    products = ["Laptop", "Phone", "Tablet", "Headphones", "Monitor"]
    regions = ["North America", "Europe", "Asia", "South America"]
    sales_data = []
    
    for i in range(150):
        date = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        product = random.choice(products)
        region = random.choice(regions)
        quantity = random.randint(1, 50)
        unit_price = round(random.uniform(50, 2000), 2)
        total = round(quantity * unit_price, 2)
        sales_data.append([date, product, region, quantity, unit_price, total])
    
    excel_writer = SimpleExcelWriter("sample_sales_data.xlsx")
    excel_writer.add_sheet("Sales Data", 
                          ["Date", "Product", "Region", "Quantity", "UnitPrice", "Total"], 
                          sales_data)
    excel_writer.save()
    print("✅ sample_sales_data.xlsx created!")
    
    # 3. Employee Data
    print("👥 Generating employee data Excel file...")
    departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"]
    employee_data = []
    
    for i in range(200):
        emp_id = f"EMP{i+1:04d}"
        name = f"Employee {i+1}"
        department = random.choice(departments)
        salary = random.randint(40000, 150000)
        hire_year = random.randint(2020, 2024)
        performance = round(random.uniform(2.5, 5.0), 1)
        employee_data.append([emp_id, name, department, salary, hire_year, performance])
    
    excel_writer = SimpleExcelWriter("sample_employee_data.xlsx")
    excel_writer.add_sheet("Employee Data", 
                          ["EmployeeID", "Name", "Department", "Salary", "HireYear", "Performance"], 
                          employee_data)
    excel_writer.save()
    print("✅ sample_employee_data.xlsx created!")

if __name__ == "__main__":
    print("🚀 Creating sample Excel files for AI Analytics App...")
    print()
    
    generate_sample_excel_files()
    
    print()
    print("🎉 All Excel files created successfully!")
    print("📁 Files created:")
    print("  - sample_financial_data.xlsx")
    print("  - sample_sales_data.xlsx") 
    print("  - sample_employee_data.xlsx")
    print()
    print("💡 Upload these .xlsx files to your AI Analytics App to test the functionality!")