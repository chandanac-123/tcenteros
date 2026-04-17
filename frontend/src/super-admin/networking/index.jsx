import CustomFilter from '@common/components/CustomeFilter'
import { DataTable } from '@common/components/DataTable'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Button } from '@pages/components/ui/button'
import { Network } from 'lucide-react'
import React from 'react'

const Networking = () => {
    const networkingFilter = [
        { key: "paid", label: "Paid" },
        { key: "pending", label: "Pending" }
    ]

    const columns = [
        {
            accessorKey: "center_name",
            header: "Center Name",
        },
        {
            accessorKey: "platform_commission",
            header: "Platform Commission",
        },
        {
            accessorKey: "commission_date",
            header: "Commission Date",
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
            center_name: "Anil Kumar S",
            platform_commission: 18000,
            commission_date: "13-07-2025",
            status: "Paid"
        },
        {
            center_name: "Priya Sharma",
            platform_commission: 22500,
            commission_date: "05-10-2024",
            status: "Pending"
        },
        {
            center_name: "Rajesh Gupta",
            platform_commission: 15000,
            commission_date: "19-11-2024",
            status: "Paid"
        },
        {
            center_name: "Sneha Patil",
            platform_commission: 20000,
            commission_date: "27-12-2024",
            status: "Paid"
        },
        {
            center_name: "Vikram Singh",
            platform_commission: 17500,
            commission_date: "02-09-2025",
            status: "Pending"
        },
        {
            center_name: "Meena Joshi",
            platform_commission: 16200,
            commission_date: "15-08-2025",
            status: "Paid"
        },
        {
            center_name: "Karan Verma",
            platform_commission: 19800,
            commission_date: "30-11-2024",
            status: "Paid"
        },
        {
            center_name: "Anita Desai",
            platform_commission: 21000,
            commission_date: "10-07-2025",
            status: "Pending"
        },
        {
            center_name: "Suresh Reddy",
            platform_commission: 18750,
            commission_date: "22-10-2024",
            status: "Paid"
        },
        {
            center_name: "Lata Nair",
            platform_commission: 23000,
            commission_date: "06-12-2024",
            status: "Pending"
        }
    ];
    return (
        <ContentLayout>
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between ">
                    <div className="flex items-center gap-4 p-4">
                        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
                            <Network size={30} className="text-onboard_primary" />
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                                Networking
                            </p>
                            <p className="text-[#393636] font-inter text-[14px] font-medium">
                                Monitor the entire platform ecosystem
                            </p>
                        </div>
                    </div>

                    <div className="pe-5">
                        <CustomFilter
                            options={networkingFilter}
                        />
                    </div>


                </div>
                <div className="px-4">
                    <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] p-3 rounded-lg">
                        <DataTable
                            columns={columns}
                            data={data}
                            loading={false}
                            // tableParams={tableParams}
                            // setTableParams={setTableParams}
                            pagination={11}
                            paginationVisibile={true}

                        />
                    </div>
                </div>
            </div>


        </ContentLayout>

    )
}

export default Networking
