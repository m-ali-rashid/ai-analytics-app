#!/usr/bin/env python3
"""
Sample Data Generator for AI Analytics App
Creates CSV files that can be easily converted to Excel format
"""

import csv
import random
from datetime import datetime, timedelta

def generate_fintech_data():
    """Generate sample financial data"""
    symbols = ["AAPL", "TSLA", "GOOG", "MSFT", "AMZN", "META"]
    start_date = datetime(2024, 1, 1)
    days = 90
    
    rows = []
    for day in range(days):
        date = start_date + timedelta(days=day)
        for symbol in symbols:
            price = round(random.uniform(100, 400), 2)
            volume = random.randint(1_000_000, 50_000_000)
            sentiment = round(random.uniform(0.3, 0.95), 2)
            market_cap = round(price * random.uniform(1_000_000, 10_000_000), 0)
            rows.append([
                date.strftime('%Y-%m-%d'),
                symbol,
                price,
                volume,
                sentiment,
                market_cap
            ])
    
    # Write to CSV
    with open('sample_fintech_data.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Date", "Symbol", "Price", "Volume", "SentimentScore", "MarketCap"])
        writer.writerows(rows)
    
    print("✅ sample_fintech_data.csv created successfully!")
    print(f"📊 Generated {len(rows)} rows of financial data")

def generate_sales_data():
    """Generate sample sales data"""
    products = ["Laptop", "Phone", "Tablet", "Headphones", "Monitor", "Keyboard", "Mouse"]
    regions = ["North America", "Europe", "Asia", "South America", "Africa"]
    sales_reps = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"]
    
    rows = []
    for month in range(1, 13):  # 12 months
        for _ in range(random.randint(50, 100)):  # Random sales per month
            date = datetime(2024, month, random.randint(1, 28))
            product = random.choice(products)
            region = random.choice(regions)
            sales_rep = random.choice(sales_reps)
            quantity = random.randint(1, 20)
            unit_price = round(random.uniform(50, 2000), 2)
            total_sales = round(quantity * unit_price, 2)
            
            rows.append([
                date.strftime('%Y-%m-%d'),
                product,
                region,
                sales_rep,
                quantity,
                unit_price,
                total_sales
            ])
    
    # Write to CSV
    with open('sample_sales_data.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Date", "Product", "Region", "SalesRep", "Quantity", "UnitPrice", "TotalSales"])
        writer.writerows(rows)
    
    print("✅ sample_sales_data.csv created successfully!")
    print(f"📊 Generated {len(rows)} rows of sales data")

def generate_employee_data():
    """Generate sample employee data"""
    departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"]
    positions = ["Manager", "Senior", "Junior", "Lead", "Director", "Analyst"]
    locations = ["New York", "San Francisco", "London", "Tokyo", "Berlin", "Sydney"]
    
    rows = []
    for i in range(500):  # 500 employees
        employee_id = f"EMP{i+1:04d}"
        name = f"Employee {i+1}"
        department = random.choice(departments)
        position = f"{random.choice(positions)} {department.rstrip('s')}"
        location = random.choice(locations)
        salary = random.randint(40000, 200000)
        hire_date = datetime(2020, 1, 1) + timedelta(days=random.randint(0, 1460))
        performance_score = round(random.uniform(2.5, 5.0), 1)
        
        rows.append([
            employee_id,
            name,
            department,
            position,
            location,
            salary,
            hire_date.strftime('%Y-%m-%d'),
            performance_score
        ])
    
    # Write to CSV
    with open('sample_employee_data.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["EmployeeID", "Name", "Department", "Position", "Location", "Salary", "HireDate", "PerformanceScore"])
        writer.writerows(rows)
    
    print("✅ sample_employee_data.csv created successfully!")
    print(f"📊 Generated {len(rows)} rows of employee data")

def main():
    """Generate all sample datasets"""
    print("🚀 Generating sample data for AI Analytics App...")
    print()
    
    generate_fintech_data()
    generate_sales_data()
    generate_employee_data()
    
    print()
    print("🎉 All sample data files created!")
    print("📝 Note: CSV files can be opened in Excel and saved as .xlsx format")
    print("💡 Upload these files to your AI Analytics App to test the functionality")

if __name__ == "__main__":
    main()
