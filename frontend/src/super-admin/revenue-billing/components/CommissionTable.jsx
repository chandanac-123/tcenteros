import { DataTable } from '@common/components/DataTable';
import React from 'react'

const CommissionTable = () => {
    const columns = [
        {
            accessorKey: "partner_name",
            header: "Partner Name",
        },
        {
            accessorKey: "region",
            header: "Region",
            cell: ({ row }) => {
                return (
                    <span className="px-2 py-1 rounded-md bg-blue-700/10 text-blue-700 text-xs">
                        {row.getValue("region")}
                    </span>
                );
            },
        },
        {
            accessorKey: "total_revenue",
            header: "Total Revenue",
        },
        {
            accessorKey: "commission",
            header: "Commission Earned",
        },
        {
            accessorKey: "paid",
            header: "Paid",
            cell: ({ row }) => {
                return (
                    <span className="px-2 py-1  text-[#268938] text-xs">
                        {row.getValue("paid")}
                    </span>
                );
            },

        },
        {
            accessorKey: "pending",
            header: "Pending",
            cell: ({ row }) => {
                return (
                    <span className=" text-[#C42A08] text-xs">
                        {row.getValue("pending")}
                    </span>
                );
            },
        },


    ];

    const tableData = [
        {
            partner_name: "Anil Kumar S",
            region: "West",
            total_revenue: 40856,
            commission: 5339,
            paid: 2339,
            pending: 2339,
        },
        {
            partner_name: "Harsh Varma",
            region: "South",
            total_revenue: 20856,
            commission: 5339,
            paid: 4339,
            pending: 4339,
        },
        {
            partner_name: "Sneha Reddy",
            region: "East",
            total_revenue: 25430,
            commission: 6120,
            paid: 3210,
            pending: 3210,
        },
        {
            partner_name: "Rohit Sharma",
            region: "North",
            total_revenue: 30210,
            commission: 4890,
            paid: 2450,
            pending: 2440,
        },
        {
            partner_name: "Priya Menon",
            region: "West",
            total_revenue: 35120,
            commission: 5780,
            paid: 3000,
            pending: 2780,
        },
        {
            partner_name: "Vikram Singh",
            region: "South",
            total_revenue: 45000,
            commission: 7200,
            paid: 3600,
            pending: 3600,
        },
        {
            partner_name: "Meera Joshi",
            region: "East",
            total_revenue: 28750,
            commission: 5950,
            paid: 3150,
            pending: 2800,
        },
        {
            partner_name: "Arjun Das",
            region: "North",
            total_revenue: 38900,
            commission: 6500,
            paid: 3300,
            pending: 3200,
        },
        {
            partner_name: "Anita Gupta",
            region: "West",
            total_revenue: 22400,
            commission: 5450,
            paid: 2900,
            pending: 2550,
        },
        {
            partner_name: "Karan Patel",
            region: "South",
            total_revenue: 33650,
            commission: 6300,
            paid: 3400,
            pending: 2900,
        },
    ];
    return (
        <div>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <DataTable
                    columns={columns}
                    data={tableData}
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

export default CommissionTable
