import { DataTable } from '@common/components/DataTable';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';





const PartnerTableList = () => {
    const [tableParams, setTableParams] = useState({
        page: 1
    });
    const navigate = useNavigate();


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
            accessorKey: "center",
            header: "Center",
        },
        {
            accessorKey: "active_centers",
            header: "Active Centers",
        },
        {
            accessorKey: "revenue",
            header: "Revenue",
        },
        {
            accessorKey: "payout",
            header: "Payout",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

                const styles = {
                    active: "bg-[#DEF4E6] text-[#34C759]",
                    inactive: "bg-[#E0DDD8] text-[#555555]",
                };

                return (
                    <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <button
                        onClick={() => navigate(`/partnersbyId/${id}`)}
                        className="px-3 py-1 text-xs border border-[#DAD9D9] rounded-full hover:bg-gray-100">
                        View
                    </button>
                );
            },
        },
    ];

    const data = [
        {
            id: 1,
            partner_name: "Anil Kumar S",
            region: "West",
            center: 13,
            active_centers: 18,
            revenue: "₹40,856",
            payout: "₹5,339",
            status: "Active",
        },
        {
            id: 2,
            partner_name: "Harsh Varma",
            region: "South",
            center: 13,
            active_centers: 18,
            revenue: "₹20,856",
            payout: "₹5,339",
            status: "Active",
        },
        {
            id: 3,
            partner_name: "Meera Joshi",
            region: "North",
            center: 15,
            active_centers: 22,
            revenue: "₹30,500",
            payout: "₹6,120",
            status: "Inactive",
        },
        {
            id: 4,
            partner_name: "Ravi Patel",
            region: "East",
            center: 12,
            active_centers: 20,
            revenue: "₹25,000",
            payout: "₹4,800",
            status: "Active",
        },
        {
            id: 5,
            partner_name: "Sonia Agarwal",
            region: "West",
            center: 11,
            active_centers: 19,
            revenue: "₹18,750",
            payout: "₹5,000",
            status: "Active",
        },
        {
            id: 6,
            partner_name: "Karan Singh",
            region: "South",
            center: 14,
            active_centers: 21,
            revenue: "₹22,300",
            payout: "₹5,450",
            status: "Inactive",
        },
        {
            id: 7,
            partner_name: "Neha Sharma",
            region: "North",
            center: 16,
            active_centers: 23,
            revenue: "₹35,000",
            payout: "₹6,700",
            status: "Active",
        },
        {
            id: 8,
            partner_name: "Vikram Joshi",
            region: "East",
            center: 13,
            active_centers: 17,
            revenue: "₹28,700",
            payout: "₹4,900",
            status: "Active",
        },
        {
            id: 9,
            partner_name: "Anita Desai",
            region: "South",
            center: 12,
            active_centers: 18,
            revenue: "₹24,100",
            payout: "₹5,200",
            status: "Inactive",
        },
    ];



    return (
        <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
            <DataTable
                columns={columns}
                data={data}
                loading={false}
                tableParams={tableParams}
                setTableParams={setTableParams}
                pagination={11}
                paginationVisibile={true}

            />
        </div>
    )
}

export default PartnerTableList
