import { useOpenSupportTicket, useSupportTickets } from '@api-queries/super-admin/support/Query';
import { DataTable } from '@common/components/DataTable';
import { Button } from '@pages/components/ui/button';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const TicketList = () => {
    const { data, isLoading, error } = useSupportTickets();
    const { mutate: openTicket } = useOpenSupportTicket();
    const tickets = (data?.tickets || data || []).sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : 0;
        const dateB = b.created_at ? new Date(b.created_at) : 0;
        return dateB - dateA;
    });

    console.log("Tickets", tickets);


    const navigate = useNavigate();

    const handleOpen = (id, status, allData) => {
        const normalizedStatus = status?.toLowerCase();

        if (normalizedStatus === "pending") {
            openTicket(id, {
                onSuccess: () => {
                    navigate(`/supportById/${id}`, {
                        state: allData,
                    });
                },
                onError: (err) => {
                    console.error(err);
                }
            });
        } else {
            navigate(`/supportById/${id}`, {
                state: allData,
            });
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading tickets</p>;

    const columns = [
        {
            accessorKey: "id",
            header: "Ticket ID",
        },

        {
            accessorKey: "center_name",
            header: "Customer  Name",
        },
        {
            accessorKey: "status",
            header: "",
            cell: ({ row }) => {
                const status = row.original.status?.toLowerCase();

                return (
                    <div className="flex items-center gap-2">
                        {status == "pending" && (
                            <span className="w-2 h-2 bg-[#48c516] rounded-full"></span>
                        )}
                    </div>
                );
            }
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
                const allData = data
                return (

                    <div className="flex items-center gap-5">
                        <Button
                            size='notificationbutton'
                            onClick={() =>
                                handleOpen(
                                    row.original.id,
                                    row.original.status,
                                    tickets
                                )
                            }
                            variant="outline_secondary"
                        >
                            View Ticket
                        </Button>
                    </div>

                );
            },
        },
    ];
    return (
        <div className='  '>
            <h3 className="text-[#3A3A3A] font-poppins text-[16px] font-semibold leading-[27px] not-italic py-3">Ticket Inbox</h3>
            <DataTable
                columns={columns}
                data={tickets}
                loading={false}
                // tableParams={tableParams}
                // setTableParams={setTableParams}
                pagination={tickets.length}
                paginationVisibile={true}
                search={false}

            />
        </div>
    )
}

export default TicketList
