import { DataTable } from '@common/components/DataTable';
import React from 'react'

const CommissionLedgerTable = () => {
    const columns = [
        {
            accessorKey: "month",
            header: "Month",
        },
        {
            accessorKey: "revenue",
            header: "Revenue",
        },
        {
            accessorKey: "commission_earned",
            header: "Commission",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

                const styles = {
                    paid: "bg-[#DEF4E6] text-[#34C759]",
                    due: "bg-[#FFE8D9] text-[#882D03]",
                };

                return (
                    <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
                    >
                        {status}
                    </span>
                );
            },
        },

    ];

    const data = [
        {
            month: "January",
            revenue: "₹5,339",
            commission_earned: "₹5,339",
            status: "Paid"
        },
        {
            month: "February",
            revenue: "₹4,872",
            commission_earned: "₹4,872",
            status: "Paid"
        },
        {
            month: "March",
            revenue: "₹6,128",
            commission_earned: "₹6,128",
            status: "Paid"
        },
        {
            month: "April",
            revenue: "₹5,995",
            commission_earned: "₹5,995",
            status: "Paid"
        },
        {
            month: "May",
            revenue: "₹5,450",
            commission_earned: "₹5,450",
            status: "Paid"
        },
        {
            month: "June",
            revenue: "₹6,230",
            commission_earned: "₹6,230",
            status: "Due"
        }
    ];

    return (
        <div>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={false}
                    // tableParams={tableParams}
                    // setTableParams={setTableParams}
                    pagination={11}
                    paginationVisibile={true}
                    search={false}

                />
            </div>
        </div>
    )
}

export default CommissionLedgerTable
