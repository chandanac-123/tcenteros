import { DataTable } from '@common/components/DataTable';
import { Button } from '@pages/components/ui/button';
import React, { useState } from 'react'
import ChangeStatusModal from './ChangeStatusModal';
import { Eye } from 'lucide-react';
import ViewLeadModal from './ViewLeadModal';

const LeadsTableList = () => {
    const [openModal, setOpenModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);

    const [selectedRow, setSelectedRow] = useState(null);
    const columns = [
        {
            accessorKey: "leadName",
            header: "Lead Name",
        },
        {
            accessorKey: "contact",
            header: "Contact",
        },
        {
            accessorKey: "city",
            header: "City",
        },
        {
            accessorKey: "source",
            header: "Source",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

                const styles = {
                    contacted: "bg-[#FFFED5] text-[#885503]",
                    new: "bg-[#D5FFE7] text-[#03881C]",
                    demo: "bg-[#E5D3F5] text-[#561290]",
                    lost: "bg-[#FFD7D5] text-[#880303]"
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
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-5">
                        <Button
                            size='notificationbutton'
                            onClick={() => {
                                setSelectedRow(row.original);
                                setOpenModal(true);
                            }}
                            variant=""
                        >
                            Change Status
                        </Button>

                        <Button
                            variant="button_filter"
                            size='icon'
                            className='rounded-full h-8 w-8'
                            onClick={() => setViewModal(true)}
                        >
                            <Eye />
                        </Button>

                    </div >

                );
            },
        },
    ];
    const leadsData = [
        {
            id: 1,
            leadName: "John Mathew",
            contact: "+91 9876543210",
            city: "Kochi",
            source: "Website",
            status: "New",
        },
        {
            id: 2,
            leadName: "Aisha Rahman",
            contact: "+91 9123456780",
            city: "Calicut",
            source: "Facebook",
            status: "Contacted",
        },
        {
            id: 3,
            leadName: "Arun Kumar",
            contact: "+91 9988776655",
            city: "Trivandrum",
            source: "Referral",
            status: "Demo",
        },
        {
            id: 4,
            leadName: "Neha Sharma",
            contact: "+91 9012345678",
            city: "Bangalore",
            source: "Instagram",
            status: "New",
        },
        {
            id: 5,
            leadName: "Rahul Nair",
            contact: "+91 9090909090",
            city: "Kochi",
            source: "Website",
            status: "Lost",
        },
    ];

    return (
        <div>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <DataTable
                    columns={columns}
                    data={leadsData}
                    loading={false}
                    // tableParams={tableParams}
                    // setTableParams={setTableParams}
                    pagination={11}
                    paginationVisibile={true}
                    search={true}

                />
            </div>
            <ChangeStatusModal
                open={openModal}
                setOpen={setOpenModal}
                data={selectedRow?.status?.toLowerCase()}
            />
            <ViewLeadModal
                open={viewModal}
                setOpen={setViewModal}
                data={selectedRow} />
        </div>
    )
}

export default LeadsTableList
