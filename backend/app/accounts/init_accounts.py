# app/accounts/init_accounts.py

from sqlalchemy.ext.asyncio import AsyncSession
from app.accounts.models.models import ChartOfAccounts
from datetime import datetime

async def initialize_center_accounts(db: AsyncSession, center_id):
    """Initialize standard chart of accounts for a new center"""

    standard_accounts = [
        # Assets (1000-1999)
        {"code": "1000", "name": "Cash and Bank", "account_type": "asset", "description": "Parent account for cash and bank"},
        {"code": "1100", "name": "Cash/Bank", "account_type": "asset", "description": "Cash and bank balance"},  # For helper compatibility
        {"code": "1110", "name": "Cash in Hand", "account_type": "asset", "description": "Physical cash"},
        {"code": "1200", "name": "Bank Account", "account_type": "asset", "description": "Bank balance"},
        {"code": "1300", "name": "Accounts Receivable", "account_type": "asset", "description": "Money owed by customers"},
        {"code": "1310", "name": "Network Receivable", "account_type": "asset", "description": "Money owed from network centers"},
        {"code": "1400", "name": "Inventory", "account_type": "asset", "description": "Stock/products"},
        {"code": "1500", "name": "Fixed Assets", "account_type": "asset", "description": "Equipment, furniture"},
        # Input Tax (GST Receivable)
        {"code": "2100", "name": "Input Tax (GST Receivable)", "account_type": "asset", "description": "GST input tax credit receivable"},
        # Optional: Settlement Receivable
        {"code": "6000", "name": "Settlement Receivable", "account_type": "asset", "description": "Amounts to be received from settlements"},

        # Liabilities (2000-2999)
        {"code": "2000", "name": "Accounts Payable", "account_type": "liability", "description": "Money owed to suppliers"},
        {"code": "2110", "name": "Salaries Payable", "account_type": "liability", "description": "Unpaid salaries"},
        {"code": "2200", "name": "GST Payable", "account_type": "liability", "description": "GST to be paid to government"},
        {"code": "2300", "name": "TDS Payable", "account_type": "liability", "description": "TDS to be deposited"},
        # Optional: Settlement Payable
        {"code": "6100", "name": "Settlement Payable", "account_type": "liability", "description": "Amounts to be paid for settlements"},

        # Equity (3000-3999)
        {"code": "3000", "name": "Owner's Capital", "account_type": "equity", "description": "Owner investment"},
        {"code": "3100", "name": "Retained Earnings", "account_type": "equity", "description": "Accumulated profit"},

        # Revenue (4000-4999)
        {"code": "4000", "name": "Membership Income", "account_type": "revenue", "description": "Revenue from memberships"},
        {"code": "4010", "name": "Membership Renewal Income", "account_type": "revenue", "description": "Revenue from membership renewals"},
        {"code": "4020", "name": "Membership Upgrade Income", "account_type": "revenue", "description": "Revenue from membership upgrades"},
        {"code": "4100", "name": "Inventory Sales Income", "account_type": "revenue", "description": "Revenue from product sales"},
        {"code": "4200", "name": "Network Income", "account_type": "revenue", "description": "Revenue from network visits (networking in)"},
        {"code": "4250", "name": "Platform Commission", "account_type": "revenue", "description": "Platform commission income"},
        {"code": "4300", "name": "Other Income", "account_type": "revenue", "description": "Miscellaneous income"},

        # Expenses (5000-5999)
        {"code": "5000", "name": "Salary Expense", "account_type": "expense", "description": "Employee salaries"},
        {"code": "5100", "name": "Rent Expense", "account_type": "expense", "description": "Facility rent"},
        {"code": "5200", "name": "Marketing Expense", "account_type": "expense", "description": "Advertising and promotion"},
        {"code": "5300", "name": "Utilities Expense", "account_type": "expense", "description": "Electricity, water, etc."},
        {"code": "5400", "name": "Cost of Goods Sold", "account_type": "expense", "description": "Cost of products sold"},
        {"code": "5500", "name": "Platform Fee Expense", "account_type": "expense", "description": "15% network platform fee"},
        {"code": "5600", "name": "General Expense", "account_type": "expense", "description": "Other operational expenses"},
        {"code": "5700", "name": "Branch Purchase Expense", "account_type": "expense", "description": "Cost of purchasing branches from platform"},
        {"code": "5800", "name": "Networking Expense", "account_type": "expense", "description": "Fees paid for members visiting other centers (networking out)"},
        {"code": "5900", "name": "Maintenance Expense", "account_type": "expense", "description": "Facility maintenance"},
        {"code": "5910", "name": "Travel Expense", "account_type": "expense", "description": "Travel and transportation"},
        {"code": "5920", "name": "Water Bill Expense", "account_type": "expense", "description": "Water utility bills"},
        {"code": "5930", "name": "Electricity Bill Expense", "account_type": "expense", "description": "Electricity utility bills"},
    ]

    for account_data in standard_accounts:
        account = ChartOfAccounts(
            center_id=center_id,
            code=account_data["code"],
            name=account_data["name"],
            account_type=account_data["account_type"],
            parent_id=None,
            description=account_data["description"],
            is_active=True,
            is_system=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            created_by=None,
            updated_by=None
        )
        db.add(account)

    await db.flush()
    print(f"✅ Created {len(standard_accounts)} standard accounts for center {center_id}")