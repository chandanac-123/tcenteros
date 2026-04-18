import { DataTable } from '@common/components/DataTable';
import { Button } from '@pages/components/ui/button';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const SupportTablelist = () => {
    const navigate = useNavigate();


    const columns = [
        {
            accessorKey: "ticketId",
            header: "Ticket ID",
        },
        {
            accessorKey: "customerName",
            header: "Customer  Name",
        },
        {
            accessorKey: "subject",
            header: "Subject",
        },
        {
            accessorKey: "dateTime",
            header: "Ticket Date & Time",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

                const styles = {
                    pending: "bg-[#FFFED5] text-[#885503]",
                    closed: "bg-[#D5FFE7] text-[#03881C]",
                    assigned: "bg-[#E5D3F5] text-[#561290]"
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
                const id = row.original.ticketId;
                const allData=ticketsData
                
                return (
                    <div className="flex items-center gap-5">
                        <Button
                            onClick={() =>
                                navigate(`/supportById/${id}`, {
                                    state: allData, 
                                    
                                })
                            }
                            variant="outline_secondary"
                            size="addbutton"
                        >
                            View Ticket
                        </Button>
                        <Button
                            size="addbutton"
                        >
                            Assign CenterAdmin
                        </Button>
                    </div>

                );
            },
        },
    ];

    const ticketsData = [
        {
            ticketId: "TKT-1246",
            customerName: "Alexandro Garnacho",
            subject: "Issue in new time schedule",
            dateTime: "13-07-2025 10:23 AM",
            status: "Pending",
        },
        {
            ticketId: "TKT-1247",
            customerName: "Maya Thompson",
            subject: "Login problems on mobile app",
            dateTime: "14-07-2025 09:45 AM",
            status: "Assigned",
        },
        {
            ticketId: "TKT-1248",
            customerName: "Carlos Rivera",
            subject: "Error 500 on checkout page",
            dateTime: "14-07-2025 11:30 AM",
            status: "Closed",
        },
        {
            ticketId: "TKT-1249",
            customerName: "Lena Wu",
            subject: "Unable to reset password",
            dateTime: "15-07-2025 08:50 AM",
            status: "Pending",
        },
        {
            ticketId: "TKT-1250",
            customerName: "Derek Johnson",
            subject: "Feature request: Dark mode",
            dateTime: "15-07-2025 10:15 AM",
            status: "Closed",
        },
        {
            ticketId: "TKT-1251",
            customerName: "Nina Patel",
            subject: "App crashes on startup",
            dateTime: "16-07-2025 09:00 AM",
            status: "Closed",
        },
        {
            ticketId: "TKT-1252",
            customerName: "Omar Ali",
            subject: "Payment gateway timeout",
            dateTime: "16-07-2025 11:45 AM",
            status: "Pending",
        },
        {
            ticketId: "TKT-1253",
            customerName: "Sophia Martinez",
            subject: "Incorrect invoice details",
            dateTime: "17-07-2025 10:05 AM",
            status: "Closed",
        },
        {
            ticketId: "TKT-1254",
            customerName: "Ethan Clark",
            subject: "Slow loading dashboard",
            dateTime: "17-07-2025 01:20 PM",
            status: "Assigned",
        },
        {
            ticketId: "TKT-1255",
            customerName: "Isabella Rossi",
            subject: "Email notifications not sent",
            dateTime: "18-07-2025 09:40 AM",
            status: "Pending",
        },
    ];

    return (
        <div>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <DataTable
                    columns={columns}
                    data={ticketsData}
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

export default SupportTablelist
