import { useAssignTicketMutation, useOpenSupportTicket, useSupportTickets } from '@api-queries/super-admin/support/Query';
import { DataTable } from '@common/components/DataTable';
import { Button } from '@pages/components/ui/button';
import { Spinner } from '@pages/components/ui/spinner';
import { BadgeCheck } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const SupportTablelist = () => {
    const { data, isLoading, error } = useSupportTickets();
    const { mutate: openTicket } = useOpenSupportTicket();
    const { mutate, isPending } = useAssignTicketMutation();
    const navigate = useNavigate();
    const tickets = data?.tickets || data || [];
    const ticketsSorted = [...tickets].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const formatCustomDateTime = (dateString) => {
        if (!dateString) return "-";

        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    };

    const handleOpen = (id, status, allData) => {
        if (status === "pending") {
            openTicket(id, {
                onSuccess: () => {
                    navigate(`/supportById/${id}`, {
                        state: allData,
                    });
                },
                onError: (err) => {
                }
            });
        } else {

            navigate(`/supportById/${id}`, {
                state: allData,
            });
        }
    };


    const handleAssign = (ticketId, centerAdmin_id) => {
        if (!ticketId || !centerAdmin_id) {
            return;
        }
        mutate({
            ticket_id: ticketId,   // make sure this exists
            centeradmin_id: centerAdmin_id,
        });
    };

    if (isLoading) {
        return (
            <div className="w-full h-[40vh] flex justify-center items-center ">
                <Spinner />
            </div>
        )
    }
    if (error) return <p>Error loading tickets</p>;

    const columns = [
        {
            accessorKey: "center_name",
            header: "Center Name",
        },
        {
            accessorKey: "member_name",
            header: "Member Email",
        },
        {
            accessorKey: "subject",
            header: "Subject",
        },
        {
            accessorKey: "created_at",
            header: "Ticket Date & Time",
            cell: ({ row }) => formatCustomDateTime(row.getValue("created_at")),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status")?.toLowerCase();

                const styles = {
                    pending: "bg-[#FFFED5] text-[#885503]",
                    open: "bg-[#D5FFE7] text-[#03881C]",
                    assigned: "bg-[#E5D3F5] text-[#561290]",
                    closed: "bg-[#FFD7D5] text-[#880303]"
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
                const id = row.original.id;
                const status = row.original.status
                const allData = ticketsData

                return (
                    <div className="flex items-center gap-5">
                        <Button
                            size='notificationbutton'
                            onClick={() => handleOpen(
                                row.original.id,
                                row.original.status,
                                ticketsData)}
                            variant="outline_secondary"
                        >
                            View Ticket
                        </Button>

                        {status == "assigned" ? (
                            <Button
                                variant="outline_secondary"
                                className="text-[#561290] flex items-center justify-center gap-2 cursor-not-allowed"
                                size="notificationbutton"

                            >
                                Assigned
                                <BadgeCheck size={16} color='#561290' />
                            </Button>
                        ) : (
                            <Button
                                size="notificationbutton"
                                onClick={() =>
                                    handleAssign(
                                        row.original.id,
                                        row.original.centeradmin_id,
                                    )
                                }
                                disabled={isPending}
                            >
                                {isPending ? "Assigning..." : "Assign CenterAdmin"}
                            </Button>
                        )}

                    </div>

                );
            },
        },
    ];

    const ticketsData = ticketsSorted;
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
