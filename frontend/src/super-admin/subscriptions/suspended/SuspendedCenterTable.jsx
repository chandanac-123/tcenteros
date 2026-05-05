import { useSuspendedSubscriptionsQuery } from '@api-queries/super-admin/subcriptions/Query';
import { DataTable } from '@common/components/DataTable';
import React from 'react'

const SuspendedCenterTable = () => {
    const { data, isLoading, error } = useSuspendedSubscriptionsQuery();
    const columns = [
        { accessorKey: "center_name", header: "Center Name" },
        { accessorKey: "center_phone", header: "Phone" },
        {
            accessorKey: "contact_person_name",
            header: "Partner Name",
            cell: ({ row }) => row.original.contact_person_name || "_ _",
        },
        { accessorKey: "renewal_date", header: "Renewal Date" },
       
        {
            accessorKey: "days_expired",
            header: "Days Expired",
            cell: ({ row }) => {
                const date = row.original.days_expired;

                return (
                    <div>
                        <p className=" bg-rose-100 text-red w-fit px-4 rounded-md border border-red font-semibold">{date}</p>
                    </div>
                )
            }
        },
    ];


    // console.log("Fetched Data for Subscription List", data);

    return (
        <div>
            <DataTable
                columns={columns}
                data={data?.suspended_centers}
                // data={data}
                // setTableParams={setTableParams}
                // tableParams={tableParams}
                // pagination={data?.pagination?.total}
                loading={isLoading}
                paginationVisibile={true}
                search={false}
            />
        </div>
    )
}

export default SuspendedCenterTable
