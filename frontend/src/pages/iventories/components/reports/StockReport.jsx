import React from 'react'
import { DataTable } from '@common/DataTable'

const StockReport = () => {
    const columns = [
        {
            accessorKey: 'date',
            header: 'Date'
        },
        {
            accessorKey: 'product',
            header: 'Product'
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity'
        },
        {
            accessorKey: 'transaction_Type',
            header: 'Transaction Type'
        },
        {
            accessorKey: 'Available',
            header: 'Available'
        },
        {
            accessorKey: 'status',
            header: 'status'
        },

    ]
    return (
        <>
            <DataTable
                columns={columns}
            />
        </>
    )
}

export default StockReport
