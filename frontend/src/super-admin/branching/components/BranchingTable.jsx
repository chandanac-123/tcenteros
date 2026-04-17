import { DataTable } from '@common/components/DataTable';
import React from 'react'

const BranchingTable = () => {

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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

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

    const data = [
        {
            center_name: "Golds Fitness",
            branch_count: 13,
            branch_amount: 5339,
            tax_amount: 45339,
            total_amount: 45339,
            status: "Paid"
        },
        {
            center_name: "FitLife Gym",
            branch_count: 10,
            branch_amount: 3250,
            tax_amount: 38250,
            total_amount: 38250,
            status: "Paid"
        },
        {
            center_name: "PowerHouse",
            branch_count: 15,
            branch_amount: 7999,
            tax_amount: 52999,
            total_amount: 52999,
            status: "Paid"
        },
        {
            center_name: "FlexZone",
            branch_count: 8,
            branch_amount: 2499,
            tax_amount: 29499,
            total_amount: 29499,
            status: "Paid"
        },
        {
            center_name: "MuscleMax",
            branch_count: 12,
            branch_amount: 4850,
            tax_amount: 47850,
            total_amount: 47850,
            status: "Pending"
        },
        {
            center_name: "Urban Fitness",
            branch_count: 11,
            branch_amount: 3200,
            tax_amount: 41200,
            total_amount: 41200,
            status: "Paid"
        },
        {
            center_name: "Peak Performance",
            branch_count: 14,
            branch_amount: 6600,
            tax_amount: 53600,
            total_amount: 53600,
            status: "Paid"
        },
        {
            center_name: "Iron Temple",
            branch_count: 9,
            branch_amount: 3750,
            tax_amount: 36750,
            total_amount: 36750,
            status: "Paid"
        }
    ];

    return (
        <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] p-3 rounded-lg">
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
    )
}

export default BranchingTable
