from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
import io
import pandas as pd
from datetime import datetime
from decimal import Decimal
from typing import List, Dict


class BillingReportGenerator:
    """Generate PDF and CSV reports for billing/sales transactions"""
    
    @staticmethod
    def generate_sales_pdf(sales_data: List[Dict], center_name: str, date_from: str, date_to: str) -> bytes:
        """Generate Billing Sales Report PDF"""
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
        elements.append(Paragraph("Billing Sales Report", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Date Range
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey
        )
        period_text = f"Period: {date_from} to {date_to}" if date_from != "all_time" else "Period: All Time"
        elements.append(Paragraph(period_text, date_style))
        elements.append(Spacer(1, 20))
        
        # Summary Stats
        total_transactions = len(sales_data)
        total_revenue = sum(Decimal(str(s.get('total_amount', 0))) for s in sales_data)
        total_tax = sum(Decimal(str(s.get('tax_amount', 0))) for s in sales_data)
        total_subtotal = sum(Decimal(str(s.get('subtotal_amount', 0))) for s in sales_data)
        
        summary_data = [
            ['Total Transactions', 'Subtotal', 'Tax', 'Total Revenue'],
            [str(total_transactions), f"₹{total_subtotal:.2f}", f"₹{total_tax:.2f}", f"₹{total_revenue:.2f}"]
        ]
        
        summary_table = Table(summary_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
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
        
        # Detailed Sales Table
        if sales_data:
            elements.append(Paragraph("Transaction Details", styles['Heading3']))
            elements.append(Spacer(1, 12))
            
            # Table headers
            table_data = [['Date', 'Order ID', 'Type', 'Customer', 'Payment', 'Subtotal', 'Tax', 'Total', 'Status']]
            
            # Table rows
            for sale in sales_data:
                date_str = sale.get('created_at', '')[:10] if sale.get('created_at') else 'N/A'
                order_id = str(sale.get('payment_order_id', ''))[:8] + '...' if sale.get('payment_order_id') else 'N/A'
                order_type = sale.get('order_type', 'N/A')
                customer = sale.get('customer_name', 'N/A')[:15]
                payment_method = sale.get('payment_method', 'N/A')
                subtotal = f"₹{float(sale.get('subtotal_amount', 0)):.2f}"
                tax = f"₹{float(sale.get('tax_amount', 0)):.2f}"
                total = f"₹{float(sale.get('total_amount', 0)):.2f}"
                status = sale.get('status', 'N/A')
                
                table_data.append([
                    date_str, order_id, order_type, customer, payment_method,
                    subtotal, tax, total, status
                ])
            
            sales_table = Table(table_data, colWidths=[
                0.8*inch, 0.8*inch, 0.8*inch, 1*inch, 0.8*inch,
                0.8*inch, 0.6*inch, 0.8*inch, 0.7*inch
            ])
            sales_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 7),
            ]))
            elements.append(sales_table)
        
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
    def generate_sales_csv(sales_data: List[Dict]) -> bytes:
        """Generate Billing Sales Report CSV"""
        df = pd.DataFrame(sales_data)
        
        # Select and rename columns
        columns_map = {
            'created_at': 'Date',
            'payment_order_id': 'Order ID',
            'order_type': 'Order Type',
            'customer_name': 'Customer',
            'payment_method': 'Payment Method',
            'subtotal_amount': 'Subtotal',
            'tax_amount': 'Tax',
            'total_amount': 'Total',
            'status': 'Status',
            'reference_id': 'Reference ID'
        }
        
        available_cols = [col for col in columns_map.keys() if col in df.columns]
        df_export = df[available_cols].copy()
        df_export.rename(columns=columns_map, inplace=True)
        
        # Format date column if exists
        if 'Date' in df_export.columns:
            df_export['Date'] = pd.to_datetime(df_export['Date']).dt.strftime('%Y-%m-%d %H:%M:%S')
        
        # Convert to CSV
        buffer = io.StringIO()
        df_export.to_csv(buffer, index=False)
        return buffer.getvalue().encode('utf-8')