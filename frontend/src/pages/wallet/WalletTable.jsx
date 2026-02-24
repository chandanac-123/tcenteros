import React, { useState } from 'react'
import { DataTable } from '@common/DataTable'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import ViewWallet from './ViewWallet'
import DeleteWallet from './DeleteWallet'
const WalletTable = () => {
    const [viewOpen, setViewOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false);




    const columns = [
        {
            accessorKey: 'id',
            header: 'Txn ID'
        },
        {
            accessorKey: 'date',
            header: 'Date'
        },
        {
            accessorKey: 'type',
            header: 'Type'
        },
        {
            accessorKey: 'category',
            header: 'Category'
        },
        {
            accessorKey: 'transaction_center',
            header: 'Transaction Center'
        },
        {
            accessorKey: 'credit',
            header: 'Credit'
        },
        {
            accessorKey: 'debit',
            header: 'Debit'
        },
        {
            accessorKey: 'balance_After',
            header: 'Balance After'
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

                const styles = {
                    paid: "bg-[#DEF4E6] text-[#34C759]",
                    reserved: "bg-[#F4F2DE] text-[#FF6200]",
                    pending: "bg-[#FFF6D6] text-[#FFCD0F]",
                };

                return (
                    <span
                        className={`inline-flex justify-center items-center min-w-[90px] px-3 py-1 rounded-[15px] text-[12px] font-poppins font-medium capitalize ${styles[status]}`}
                    >
                        {row.getValue("status")}
                    </span>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => (
                <span className='flex gap-3'>

                    <button onClick={() => {
                        setViewOpen(true)
                    }}>
                        <img src={view} alt='view' />
                    </button>
                    <button
                        onClick={() => {
                            setDeleteOpen(true);
                        }}>
                        <img src={deleteicon} alt='delete' />
                    </button>

                </span>
            )
        },

    ]

    const data = [
        {
            id: "TXN1001",
            date: "23 Feb 2026",
            type: "Credit",
            category: "Membership Payment",
            transaction_center: "Kochi Fitness Hub",
            credit: 2500,
            debit: 0,
            balance_After: 24853,
            status: "Reserved",
        },
        {
            id: "TXN1002",
            date: "22 Feb 2026",
            type: "Debit",
            category: "Equipment Purchase",
            transaction_center: "Ernakulam Branch",
            credit: 0,
            debit: 1200,
            balance_After: 22353,
            status: "pending",
        },
        {
            id: "TXN1003",
            date: "21 Feb 2026",
            type: "Credit",
            category: "Network Earnings",
            transaction_center: "Fort Kochi Center",
            credit: 800,
            debit: 0,
            balance_After: 23553,
            status: "paid",
        },
        {
            id: "TXN1004",
            date: "20 Feb 2026",
            type: "Debit",
            category: "Maintenance",
            transaction_center: "Kakkanad Gym",
            credit: 0,
            debit: 500,
            balance_After: 22753,
            status: "Pending",
        },
        {
            id: "TXN1005",
            date: "19 Feb 2026",
            type: "Credit",
            category: "Personal Training",
            transaction_center: "Aluva Fitness Point",
            credit: 1500,
            debit: 0,
            balance_After: 23253,
            status: "paid",
        },
        {
            id: "TXN1006",
            date: "18 Feb 2026",
            type: "Debit",
            category: "Utility Bill",
            transaction_center: "Kochi Fitness Hub",
            credit: 0,
            debit: 950,
            balance_After: 21753,
            status: "Reserved",
        },
    ];
    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                paginationVisibile={true}
            />

            <ViewWallet
                open={viewOpen}
                setOpen={setViewOpen}
            />

            <DeleteWallet
                open={deleteOpen}
                setOpen={setDeleteOpen}
            />



        </>
    )
}

export default WalletTable
