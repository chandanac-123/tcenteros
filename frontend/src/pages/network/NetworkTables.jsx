import React, { useState } from 'react'
import { DataTable } from '@common/DataTable'
import view from '@assets/form-icons/view.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import ApproveModal from './ApproveModal'
import { useNavigate } from 'react-router-dom'



const NetworkTables = ({ activeTab }) => {

    const [approveOpen, setApproveOpen] = useState(false)
    const navigate = useNavigate();

  

  console.log("Pararra", activeTab);

  const renderActions = (data) => {
    switch (activeTab) {
      case "Network":
        return (
          <span className="flex gap-3">
            <button>
              <img src={view} alt="view" />
            </button>
            <button>
              <img src={deleteicon} alt="delete" />
            </button>
          </span>
        );
      case "Requests":
        if (data.action === "Pending") {
          return (
            <span className="flex items-center gap-2 w-full">
              <button className="flex-[1] shrink-0">
                <img src={view} alt="view" />
              </button>

              <button className="flex-[4] border py-1 rounded-md font-medium">
                Deny
              </button>

              <button  onClick={() => setApproveOpen(true)}
               className="flex-[4] border py-1 bg-primary text-white rounded-md font-medium">
                Approve
              </button>
               <ApproveModal open={approveOpen} setOpen={setApproveOpen} data={data} />
            </span>

          );
        }

        if (data.action === "Approved") {
          return (
            <span className="flex items-center gap-2 w-full">
              <button className="flex-[1] shrink-0">
                <img src={view} alt="view" />
              </button>

              <span className="flex-[8] text-center border border-[#1452D4] py-1 bg-[#D9E5FF] text-[#1452D4] rounded-md font-medium">
                Approved
              </span>
            </span>

          );
        }

        return null;


      default:
        return (
          <span className="flex gap-3">
            <button onClick={() => navigate("/centerview")} >
              <img src={view} alt="view" />
            </button>
            <button>
              <img src={deleteicon} alt="delete" />
            </button>
          </span>
        );
    }
  };


  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Name'
    },
    {
      accessorKey: 'home_center',
      header: 'Home  Center '
    },
    {
      accessorKey: 'center_number',
      header: 'Center Number'
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date'
    },
    {
      accessorKey: 'end_Date',
      header: 'End Date'
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => renderActions(row.original)
    },

  ]


  const allData = [
    {
      id: 1,
      full_name: "Rahul Nair",
      home_center: "Kochi Central",
      center_number: "CN-1021",
      start_date: "01 Jan 2025",
      end_Date: "—",
      action: "Active",
      status: "Network"
    },
    {
      id: 2,
      full_name: "Anjali Menon",
      home_center: "Ernakulam Hub",
      center_number: "CN-1022",
      start_date: "10 Feb 2025",
      end_Date: "—",
      action: "Active",
      status: "Network"
    },
    {
      id: 3,
      full_name: "Arjun Pillai",
      home_center: "Trivandrum Center",
      center_number: "CN-1101",
      start_date: "05 Mar 2025",
      end_Date: "—",
      action: "Pending",
      status: "Requests"
    },
    {
      id: 6,
      full_name: "Sarath Vasu",
      home_center: "Malappuram Center",
      center_number: "MP-2442",
      start_date: "19 Apr 2025",
      end_Date: "—",
      action: "Approved",
      status: "Requests"
    },
    {
      id: 4,
      full_name: "Meera Joseph",
      home_center: "Kottayam Branch",
      center_number: "CN-1201",
      start_date: "01 Dec 2024",
      end_Date: "31 Dec 2024",
      action: "Completed",
      status: "Completed"
    }
  ]


  const tableData = allData.filter(item => item.status === activeTab)


  return (
    <DataTable
      columns={columns}
      data={tableData}
      paginationVisibile={true}
    />
  )
}

export default NetworkTables
