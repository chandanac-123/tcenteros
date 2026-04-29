import { DataTable } from "@common/components/DataTable";
import { Button } from "@pages/components/ui/button";
import React, { useEffect, useState } from "react";
import ChangeStatusModal from "./ChangeStatusModal";
import { Eye, UserRoundCog } from "lucide-react";
import ViewLeadModal from "./ViewLeadModal";
import CustomFilter from "@common/components/CustomeFilter";
import { useAllLeads } from "@api-queries/partner/lead-managements/Query";
import LeadCards from "./leadCards";

const LeadsTableList = ({ dashboarView = false }) => {
  const [openModal, setOpenModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: "",
  });
  const [filters, setFilters] = useState({
    lead_status: undefined,
    source: undefined,
    skip: 0,
    limit: 10,
  });
  const { data, isLoading } = useAllLeads(filters);

  console.log("Data in Leads", data);

  const leadsFilter = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "interested", label: "Interested" },
    { value: "converted", label: "Converted" },
    { value: "closed", label: "Closed" },
  ];

  const columns = [
    { accessorKey: "center_name", header: "Lead Name" },
    {  accessorKey: "phone_number",  header: "Contact",
    },
    {  accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "lead_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("lead_status")?.toLowerCase();

        const styles = {
          contacted: "bg-[#FFFED5] text-[#885503]",
          new: "bg-[#D5FFE7] text-[#03881C]",
          demo_done: "bg-[#E5D3F5] text-[#561290]",
          interested: "bg-[#a5dcf0] text-[#083963]",
          converted: "bg-[#8b5e0a] text-[#ffff]",
          closed: "bg-[#f5c1c1] text-[#bd0909]",
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
        const status = row.original?.lead_status?.toLowerCase();

        return (
          <div className="flex items-center gap-5">
            {status === "converted" ? (
              <Button
                variant="outline_secondary"
                size="notificationbutton"
                className="cursor-not-allowed"
              >
                Change Status
              </Button>
            ) : (
              <Button
                size="notificationbutton"
                onClick={() => {
                  setSelectedRow(row.original);
                  setOpenModal(true);
                }}
              >
                Change Status
              </Button>
            )}

            <Button
              variant="button_filter"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => {
                setSelectedRow(row.original);
                setViewModal(true);
              }}
            >
              <Eye />
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      skip: (tableParams.page - 1) * prev.limit,
    }));
  }, [tableParams.page]);

  const leadsData = dashboarView
    ? (data?.data || []).slice(0, 3) //only first 3
    : data?.data || [];
  return (
    <div className="flex flex-col gap-3">
      {!dashboarView && <LeadCards data={data?.counts} />}
      <div
        className={`${!dashboarView ? "shadow-[0px_5px_15px_rgba(0,0,0,0.35)]" : ""} rounded-md p-4`}
      >
        {!dashboarView && (
          <div className="flex items-center justify-between p-2">
            <h2 className="text-black font-poppins text-[20px] font-semibold leading-8 tracking-[-0.4px]">
              All Leads
            </h2>
            <CustomFilter
              options={leadsFilter}
              onApply={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  lead_status: value || undefined,
                  skip: 0,
                }))
              }
            />
          </div>
        )}
        {dashboarView && (
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
              <UserRoundCog />
            </div>
            <span className="text-md font-semibold">My Leads</span>
          </div>
        )}
        <DataTable
          columns={columns}
          data={leadsData}
          loading={isLoading}
          tableParams={tableParams}
          setTableParams={setTableParams}
          pagination={dashboarView ? false : data?.counts}
          paginationVisibile={true}
          search={false}
        />
      </div>
      <ChangeStatusModal
        open={openModal}
        setOpen={setOpenModal}
        data={selectedRow}
      />
      <ViewLeadModal
        open={viewModal}
        setOpen={setViewModal}
        data={selectedRow}
      />
    </div>
  );
};

export default LeadsTableList;
