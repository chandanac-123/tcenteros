from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import pandas as pd
from datetime import datetime
from decimal import Decimal
import io
from typing import List, Dict, Any


class ReportGenerator:
    """Generate PDF and CSV reports for sales and purchases"""
    
    @staticmethod
    def generate_sales_pdf(sales_data: List[Dict], center_name: str, date_from: str, date_to: str) -> bytes:
        """Generate Sales Report PDF"""
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
        elements.append(Paragraph("Sales Report", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Date Range
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey
        )
        elements.append(Paragraph(f"Period: {date_from} to {date_to}", date_style))
        elements.append(Spacer(1, 20))
        
        # Summary Stats
        total_sales = len(sales_data)
        total_revenue = sum(Decimal(str(s.get('total', 0))) for s in sales_data)
        total_tax = sum(Decimal(str(s.get('tax', 0))) for s in sales_data)
        
        summary_data = [
            ['Total Sales', 'Total Revenue', 'Total Tax'],
            [str(total_sales), f"₹{total_revenue:.2f}", f"₹{total_tax:.2f}"]
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
        
        # Detailed Sales Table
        if sales_data:
            elements.append(Paragraph("Sales Details", styles['Heading3']))
            elements.append(Spacer(1, 12))
            
            # Table headers
            table_data = [['Date', 'Sale #', 'Items', 'Subtotal', 'Tax', 'Total', 'Status']]
            
            # Table rows
            for sale in sales_data:
                table_data.append([
                    sale.get('created_at', '')[:10],
                    sale.get('sale_number', ''),
                    str(sale.get('items_count', 0)),
                    f"₹{sale.get('subtotal', '0.00')}",
                    f"₹{sale.get('tax', '0.00')}",
                    f"₹{sale.get('total', '0.00')}",
                    sale.get('status', '').upper()
                ])
            
            sales_table = Table(table_data, colWidths=[1*inch, 1*inch, 0.7*inch, 1*inch, 0.8*inch, 1*inch, 1*inch])
            sales_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
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
    def generate_purchase_pdf(purchases_data: List[Dict], center_name: str, date_from: str, date_to: str) -> bytes:
        """Generate Purchase Report PDF"""
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
        elements.append(Paragraph("Purchase Report", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Date Range
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey
        )
        elements.append(Paragraph(f"Period: {date_from} to {date_to}", date_style))
        elements.append(Spacer(1, 20))
        
        # Summary Stats
        total_purchases = len(purchases_data)
        total_cost = sum(Decimal(str(p.get('total', 0))) for p in purchases_data)
        total_quantity = sum(int(p.get('quantity_added', 0)) for p in purchases_data)
        
        summary_data = [
            ['Total Purchases', 'Total Quantity', 'Total Cost'],
            [str(total_purchases), str(total_quantity), f"₹{total_cost:.2f}"]
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
        
        # Detailed Purchase Table
        if purchases_data:
            elements.append(Paragraph("Purchase Details", styles['Heading3']))
            elements.append(Spacer(1, 12))
            
            table_data = [['Date', 'Product', 'Supplier', 'Quantity', 'Unit Cost', 'Total']]
            
            for purchase in purchases_data:
                table_data.append([
                    purchase.get('invoice_date', '')[:10] if purchase.get('invoice_date') else '',
                    purchase.get('product_name', '')[:20],
                    purchase.get('supplier_name', '')[:15] if purchase.get('supplier_name') else 'N/A',
                    str(purchase.get('quantity_added', 0)),
                    f"₹{purchase.get('cost_price', '0.00')}",
                    f"₹{purchase.get('total', '0.00')}"
                ])
            
            purchase_table = Table(table_data, colWidths=[1*inch, 1.5*inch, 1.2*inch, 0.8*inch, 1*inch, 1*inch])
            purchase_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#70AD47')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
            ]))
            elements.append(purchase_table)
        
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
        """Generate Sales Report CSV"""
        df = pd.DataFrame(sales_data)
        
        # Select and rename columns
        columns_map = {
            'created_at': 'Date',
            'sale_number': 'Sale Number',
            'items_count': 'Items Count',
            'subtotal': 'Subtotal',
            'tax': 'Tax',
            'total': 'Total',
            'status': 'Status',
            'payment_status': 'Payment Status'
        }
        
        available_cols = [col for col in columns_map.keys() if col in df.columns]
        df_export = df[available_cols].copy()
        df_export.rename(columns=columns_map, inplace=True)
        
        # Convert to CSV
        buffer = io.StringIO()
        df_export.to_csv(buffer, index=False)
        return buffer.getvalue().encode('utf-8')
    
    @staticmethod
    def generate_purchase_csv(purchases_data: List[Dict]) -> bytes:
        """Generate Purchase Report CSV"""
        df = pd.DataFrame(purchases_data)
        
        columns_map = {
            'invoice_date': 'Date',
            'product_name': 'Product Name',
            'supplier_name': 'Supplier',
            'quantity_added': 'Quantity',
            'cost_price': 'Unit Cost',
            'total': 'Total',
            'available_quantity': 'Current Stock'
        }
        
        available_cols = [col for col in columns_map.keys() if col in df.columns]
        df_export = df[available_cols].copy()
        df_export.rename(columns=columns_map, inplace=True)
        
        buffer = io.StringIO()
        df_export.to_csv(buffer, index=False)
        return buffer.getvalue().encode('utf-8')