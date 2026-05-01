import { DataTable } from '@common/components/DataTable';
import React from 'react'

const SuspendedCenterTable = () => {
    const columns = [
        { accessorKey: "center_name", header: "Center Name" },
        { accessorKey: "center_phone", header: "Phone" },
        {
            accessorKey: "partner_name",
            header: "Partner Name",
            cell: ({ row }) => row.original.partner_name || "_ _",
        },
        { accessorKey: "dateOf_Suspended", header: "Suspended Date" },
    ];
    const data = [
        {
            center_id: "1",
            center_name: "Center Alpha",
            center_phone: "9876543210",
            partner_name: "FitPartner",
            dateOf_Suspended: "2026-04-25",
        },
        {
            center_id: "2",
            center_name: "Center Beta",
            center_phone: "9123456780",
            partner_name: null,
            dateOf_Suspended: "2026-04-20",
        },
        {
            center_id: "3",
            center_name: "Center Gamma",
            center_phone: "9988776655",
            partner_name: "WellnessHub",
            dateOf_Suspended: "2026-04-18",
        },
        {
            center_id: "4",
            center_name: "Center Delta",
            center_phone: "9090909090",
            partner_name: null,
            dateOf_Suspended: "2026-04-15",
        },
    ];
    return (
        <div>
            <DataTable
                columns={columns}
                data={data}
                // data={data}
                // setTableParams={setTableParams}
                // tableParams={tableParams}
                // pagination={data?.pagination?.total}
                // loading={isLoading}
                paginationVisibile={true}
                search={false}
            />
        </div>
    )
}

export default SuspendedCenterTable
