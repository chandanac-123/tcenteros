import { DataTable } from '@common/components/DataTable';
import React from 'react'

const AssignedCenterTable = () => {
    const columns = [
        {
            accessorKey: "center_name",
            header: "Center Name",
        },
        {
            accessorKey: "commission_amount",
            header: "Commission Amount",
        },
        {
            accessorKey: "monthly_revenue",
            header: "Monthly Revenue ",
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
            accessorKey: "total_revenue",
            header: "Total Revenue",
        },


    ];

    const centerData = [
        {
            center_name: "Golds Fitness",
            monthly_revenue: "₹45,339",
            commission_amount: "₹5,339",
            total_revenue: "₹2,34,655",
            status: "inactive"
        },
        {
            center_name: "FitPulse Gym",
            monthly_revenue: "₹38,200",
            commission_amount: "₹3,800",
            total_revenue: "₹1,90,000",
            status: "Active"
        },
        {
            center_name: "Ironclad Athletics",
            monthly_revenue: "₹52,750",
            commission_amount: "₹7,250",
            total_revenue: "₹2,65,500",
            status: "Active"
        },
        {
            center_name: "Zenith Wellness",
            monthly_revenue: "₹29,900",
            commission_amount: "₹2,900",
            total_revenue: "₹1,45,000",
            status: "Active"
        },
        {
            center_name: "Peak Performance Studio",
            monthly_revenue: "₹41,800",
            commission_amount: "₹4,800",
            total_revenue: "₹2,10,400",
            status: "Active"
        },
        {
            center_name: "Revive Health Club",
            monthly_revenue: "₹35,600",
            commission_amount: "₹3,600",
            total_revenue: "₹1,78,000",
            status: "Active"
        }
    ];

    return (
        <div>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <DataTable
                    columns={columns}
                    data={centerData}
                    loading={false}
                    // tableParams={tableParams}
                    // setTableParams={setTableParams}
                    pagination={11}
                    paginationVisibile={true}

                />
            </div>
        </div>
    )
}

export default AssignedCenterTable
