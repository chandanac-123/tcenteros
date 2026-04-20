import { DataTable } from '@common/components/DataTable';
import React from 'react'

const BranchingTable = ({ data, isLoading, tableParams, setTableParams,pagination }) => {

    const columns = [
        {
            accessorKey: "center_name",
            header: "Center Name",
        },
        {
            accessorKey: "branch_count",
            header: "Branch count",
        },
        {
            accessorKey: "branch_amount",
            header: "Branch Amount",
        },
        {
            accessorKey: "tax_amount",
            header: "Tax Amount",
        },
        {
            accessorKey: "total_amount",
            header: "Total Amount",
        },
        {
            accessorKey: "payment_status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("payment_status")?.toLowerCase();

                const styles = {
                    paid: "bg-[#DEF4E6] text-[#34C759]",
                    pending: "bg-[#FFF3D5] text-[#F35D0D]",
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

    
    return (
        <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] p-3 rounded-lg">
            <DataTable
                columns={columns}
                data={data}
                loading={isLoading}
                tableParams={tableParams}
                setTableParams={setTableParams}
                pagination={pagination}
                paginationVisibile={true}
                search={false}
            />
        </div>
    )
}

export default BranchingTable
