import { DataTable } from '@common/components/DataTable';
import { Button } from '@pages/components/ui/button';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const TicketList = ({ data }) => {
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
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const id = row.original.ticketId;
                const allData = data
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
                    </div>

                );
            },
        },
    ];

    return (
        <div>
            <div className='shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4'>
                <h3 className="text-[#3A3A3A] font-poppins text-[16px] font-semibold leading-[27px] not-italic py-3">Ticket Inbox</h3>
                <DataTable
                    columns={columns}
                    data={data}
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

export default TicketList
