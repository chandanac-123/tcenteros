from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
import pandas as pd
import io
from datetime import datetime
from decimal import Decimal
from typing import List, Dict


class ConsolidatedReportGenerator:
    """Generate PDF and CSV reports for consolidated income, expense, and settlement reports"""
    
    @staticmethod
    def generate_income_pdf(income_data: List[Dict], center_name: str, date_from: str, date_to: str, include_branches: bool) -> bytes:
        """Generate Consolidated Income Report PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"{center_name}", title_style))
        elements.append(Paragraph("Consolidated Income Report", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Date Range and Branch Info
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey
        )
        elements.append(Paragraph(f"Period: {date_from} to {date_to}", date_style))
        elements.append(Paragraph(f"Includes Sub-branches: {'Yes' if include_branches else 'No'}", date_style))
        elements.append(Spacer(1, 20))
        
        # Summary Stats
        total_revenue = sum(Decimal(str(i.get('Total', 0))) for i in income_data)
        total_transactions = sum(int(i.get('Transactions', 0)) for i in income_data)
        total_tax = sum(Decimal(str(i.get('Tax', 0))) for i in income_data)
        
        summary_data = [
            ['Total Revenue', 'Total Transactions', 'Total Tax'],
            [f"₹{total_revenue:.2f}", str(total_transactions), f"₹{total_tax:.2f}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 2*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        # Detailed Income Table
        if income_data:
            table_data = [['Date', 'Center', 'Category', 'Type', 'Total', 'Count']]
            for item in income_data[:50]:  # Limit to 50 rows per page
                table_data.append([
                    str(item.get('Date', 'N/A')),
                    str(item.get('Center', 'N/A'))[:20],
                    str(item.get('Category', 'N/A')),
                    str(item.get('Type', 'N/A'))[:15],
                    f"₹{float(item.get('Total', 0)):.2f}",
                    str(item.get('Transactions', 0))
                ])
            
            detail_table = Table(table_data, colWidths=[1*inch, 1.5*inch, 1*inch, 1*inch, 1*inch, 0.8*inch])
            detail_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
            ]))
            elements.append(detail_table)
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def generate_income_csv(income_data: List[Dict]) -> bytes:
        """Generate Consolidated Income Report CSV"""
        df = pd.DataFrame(income_data)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        return buffer.getvalue().encode('utf-8')
    
    @staticmethod
    def generate_expense_pdf(expense_data: List[Dict], center_name: str, date_from: str, date_to: str, include_branches: bool) -> bytes:
        """Generate Consolidated Expense Report PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"{center_name}", title_style))
        elements.append(Paragraph("Consolidated Expense Report", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Date Range
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey
        )
        elements.append(Paragraph(f"Period: {date_from} to {date_to}", date_style))
        elements.append(Paragraph(f"Includes Sub-branches: {'Yes' if include_branches else 'No'}", date_style))
        elements.append(Spacer(1, 20))
        
        # Summary Stats
        total_expense = sum(Decimal(str(e.get('Net Amount', 0))) for e in expense_data)
        total_count = sum(int(e.get('Count', 0)) for e in expense_data)
        
        summary_data = [
            ['Total Expenses', 'Total Items'],
            [f"₹{total_expense:.2f}", str(total_count)]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        # Detailed Expense Table
        if expense_data:
            table_data = [['Date', 'Center', 'Category', 'Gross', 'Deductions', 'Net', 'Count']]
            for item in expense_data[:50]:
                table_data.append([
                    str(item.get('Date', 'N/A')),
                    str(item.get('Center', 'N/A'))[:15],
                    str(item.get('Category', 'N/A')),
                    f"₹{float(item.get('Gross Amount', 0)):.2f}",
                    f"₹{float(item.get('Deductions', 0)):.2f}",
                    f"₹{float(item.get('Net Amount', 0)):.2f}",
                    str(item.get('Count', 0))
                ])
            
            detail_table = Table(table_data, colWidths=[0.9*inch, 1.2*inch, 1*inch, 1*inch, 1*inch, 1*inch, 0.7*inch])
            detail_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTSIZE', (0, 1), (-1, -1), 7),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
            ]))
            elements.append(detail_table)
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def generate_expense_csv(expense_data: List[Dict]) -> bytes:
        """Generate Consolidated Expense Report CSV"""
        df = pd.DataFrame(expense_data)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        return buffer.getvalue().encode('utf-8')
    
    @staticmethod
    def generate_settlement_pdf(settlement_data: List[Dict], center_name: str, date_from: str, date_to: str, include_branches: bool) -> bytes:
        """Generate Consolidated Settlement Report PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"{center_name}", title_style))
        elements.append(Paragraph("Consolidated Settlement Report", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Date Range
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey
        )
        elements.append(Paragraph(f"Period: {date_from} to {date_to}", date_style))
        elements.append(Paragraph(f"Includes Sub-branches: {'Yes' if include_branches else 'No'}", date_style))
        elements.append(Spacer(1, 20))
        
        # Summary Stats
        total_amount = sum(Decimal(str(s.get('Total Amount', 0))) for s in settlement_data)
        platform_commission = sum(Decimal(str(s.get('Platform Commission (10%)', 0))) for s in settlement_data)
        center_share = sum(Decimal(str(s.get('Center Share (90%)', 0))) for s in settlement_data)
        
        summary_data = [
            ['Total Amount', 'Platform Share', 'Center Share'],
            [f"₹{total_amount:.2f}", f"₹{platform_commission:.2f}", f"₹{center_share:.2f}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 2*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        # Detailed Settlement Table
        if settlement_data:
            table_data = [['Date', 'Center', 'Type', 'Total', 'Platform', 'Center', 'Status']]
            for item in settlement_data[:50]:
                table_data.append([
                    str(item.get('Date', 'N/A')),
                    str(item.get('Center', 'N/A'))[:12],
                    str(item.get('Order Type', 'N/A'))[:10],
                    f"₹{float(item.get('Total Amount', 0)):.2f}",
                    f"₹{float(item.get('Platform Commission (10%)', 0)):.2f}",
                    f"₹{float(item.get('Center Share (90%)', 0)):.2f}",
                    str(item.get('Settlement Status', 'N/A'))[:8]
                ])
            
            detail_table = Table(table_data, colWidths=[0.8*inch, 1*inch, 0.9*inch, 1*inch, 1*inch, 1*inch, 0.8*inch])
            detail_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('FONTSIZE', (0, 1), (-1, -1), 7),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
            ]))
            elements.append(detail_table)
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def generate_settlement_csv(settlement_data: List[Dict]) -> bytes:
        """Generate Consolidated Settlement Report CSV"""
        df = pd.DataFrame(settlement_data)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        return buffer.getvalue().encode('utf-8')