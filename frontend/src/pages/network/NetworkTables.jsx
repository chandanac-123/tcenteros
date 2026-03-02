import React, { useState } from 'react'
import { DataTable } from '@common/DataTable'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import ApproveModal from './ApproveModal'
import { useNavigate } from 'react-router-dom'
import { Button } from '@pages/components/ui/button'
import DeleteModal from './DeleteModal'




const NetworkTables = ({ activeTab, data, tableParams, setTableParams, pagination }) => {

  const [selectedRow, setSelectedRow] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const navigate = useNavigate();


  const renderActions = (data) => {
    switch (activeTab) {
      case "Network":
        return (
          <span className="flex gap-3">
            <button onClick={() =>
              navigate(`/centerview/${data.network_membership_id}`)
            }>
              <img src={view} alt="view" />
            </button>
            <button onClick={() => {
              setSelectedRow(data);
              setDeleteOpen(true);
            }}>
              <img src={deleteicon} alt="delete" />
            </button>
          </span>
        );
      case "Requests":
        if (data.network_status?.toLowerCase() === "pending") {
          return (
            <span className="flex items-center gap-2 w-full">
              <button onClick={() => navigate(`/centerview/${data.network_membership_id}`)} className="">
                <img src={view} alt="view" />
              </button>

              {/* <Button
                size='addbutton'
                variant='outline_secondary'
                type='button'
              > Deny</Button> */}

              <Button
                onClick={() => {
                  setSelectedRow(data);
                  setApproveOpen(true);
                }} size='addbutton'
                variant='button_filled'
                type='button'
              > Approve</Button>
            </span>

          );
        }

        if (data.network_status?.toLowerCase() === "approved") {
          return (
            <span className="flex items-center gap-2 ">
              <button onClick={() => navigate(`/centerview/${data.network_membership_id}`)} className="">
                <img src={view} alt="view" />
              </button>

              <Button

                size='addbutton'
                variant='outline_primary'
                type='button'

              > Approved</Button>
            </span>

          );
        }

        if (data.network_status === "paid") {
          return (
            <span className="flex items-center gap-2 ">
              <button onClick={() => navigate(`/centerview/${data.network_membership_id}`)} className="">
                <img src={view} alt="view" />
              </button>

              <Button

                size='addbutton'
                variant='outline_primary'
                type='button'

              > Paid</Button>
            </span>

          );
        }

        return null;


      default:
        return (
          <span className="flex gap-3">
            <button onClick={() => navigate(`/centerview/${data.network_membership_id}`)} >
              <img src={view} alt="view" />
            </button>
            <button onClick={() => {
              setSelectedRow(data);
              setDeleteOpen(true);
            }}>
              <img src={deleteicon} alt="delete" />
            </button>
          </span>
        );
    }
  };


  const columns = [
    {
      accessorKey: 'member_full_name',
      header: 'Name'
    },
    {
      accessorKey: 'home_center_name',
      header: 'Home  Center '
    },
    {
      accessorKey: 'home_center_mobile',
      header: 'Center Number'
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date'
    },
    {
      accessorKey: 'end_date',
      header: 'End Date'
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => renderActions(row.original)
    },

  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={pagination}
        paginationVisibile={true}
      />
      {selectedRow && (
        <ApproveModal
          open={approveOpen}
          setOpen={setApproveOpen}
          data={selectedRow}
        />
      )}
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        data={selectedRow} />
    </>
  )
}

export default NetworkTables
