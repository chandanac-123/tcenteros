import CustomeModal from "@common/components/CustomeModal";
import {
  Building,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shapes,
  Tag,
  User,
} from "lucide-react";
import React from "react";

const ViewLeadModal = ({ open, setOpen, data }) => {
  const styles = [
    {
      label: "new",
      bg: "bg-[#D5FFE7]",
      text: "text-[#03881C]",
      border: "border-[#03881C]",
    },
    {
      label: "contacted",
      bg: "bg-[#FFFED5]",
      text: "text-[#885503]",
      border: "border-[#885503]",
    },
    {
      label: "interested",
      bg: "bg-[#a5dcf0]",
      text: "text-[#083963]",
      border: "border-[#083963]",
    },
    {
      label: "demo_done",
      bg: "bg-[#E5D3F5]",
      text: "text-[#561290]",
      border: "border-[#561290]",
    },
    {
      label: "closed",
      bg: "bg-[#FFD7D5]",
      text: "text-[#880303]",
      border: "border-[#880303]",
    },
    {
      label: "converted",
      bg: "bg-[#8b5e0a]",
      text: "text-[#ffff]",
      border: "border-[#8b5e0a]",
    },
  ];
  const currentStatus = data?.lead_status?.toLowerCase();

  const statusStyle = styles.find((item) => item.label === currentStatus) || {};

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      className="lg:p-10"
      header=""
    >
      <div className="w-full flex flex-col gap-4 bg-[#FFFFFF] rounded-xl p-4 md:p-8 shadow-[0px_2px_15px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-[#222121]">
              {data?.center_name}
            </h2>
            {/* <p className="text-sm md:text-base text-[#7F7F7F]">
                            LD#3324 • Mumbai
                        </p> */}
          </div>

          {/* Status */}
          <div
            className={`flex justify-center items-center gap-2 px-4 py-1 rounded-lg text-sm font-semibold capitalize
    ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {currentStatus?.replace("_", " ")}
          </div>
        </div>

        {/* Info */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {/* Item */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center shrink-0">
              <Building size={18} className="text-[#1452D4]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm text-[#555555]">Lead Name</p>
              <p className="text-sm font-semibold text-[#2C2C2C] truncate">
                {data?.center_name}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center shrink-0">
              <User size={18} className="text-[#1452D4]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm text-[#555555]">Contact Person</p>
              <p className="text-sm font-semibold text-[#2C2C2C] truncate">
                {data?.contact_person_name}
              </p>
            </div>
          </div>

          {/* Renewal */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center">
              <Phone size={18} className="text-[#1452D4]" />
            </div>
            <div>
              <p className="text-sm text-[#555555]">Phone number</p>
              <p className="text-sm font-semibold text-[#2C2C2C]">
                {data?.phone_number}
              </p>
            </div>
          </div>

          {/* Lead Source */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center">
              <Tag size={18} className="text-[#1452D4]" />
            </div>
            <div>
              <p className="text-sm text-[#555555]">Lead Source</p>
              <p className="text-sm font-semibold text-[#2C2C2C]">
                {data?.source}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center">
              <Mail size={18} className="text-[#1452D4]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#555555]">Email</p>
              <p className="text-sm font-semibold text-[#2C2C2C] truncate">
                {data?.email}
              </p>
            </div>
          </div>

          {/* Business Type */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center">
              <Shapes size={18} className="text-[#1452D4]" />
            </div>
            <div>
              <p className="text-sm text-[#555555]">Business Type</p>
              <p className="text-sm font-semibold text-[#2C2C2C]">
                {data?.center_type}
              </p>
            </div>
          </div>

          {/* Assigned */}
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center">
              <Calendar size={18} className="text-[#1452D4]" />
            </div>
            <div>
              <p className="text-sm text-[#555555]">Assigned At</p>
              <p className="text-sm font-semibold text-[#2C2C2C]">
                2026-04-18 10:30 AM
              </p>
            </div>
          </div>

          {/* Address (balanced) */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-start gap-3 px-4 py-2">
            <div className="h-10 w-10 rounded-xl bg-[#E3ECFF] flex items-center justify-center">
              <MapPin size={18} className="text-[#1452D4]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#555555]">Address</p>
              <p className="text-sm font-semibold text-[#2C2C2C] break-words">
                {data?.address_line_1},{data?.country},{data?.state},
                {data?.city},{data?.postal_code}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-[20px]  text-[#222121]">Remarks</h2>
          <div className="px-4">
            <p className="text-sm md:text-base text-[#7F7F7F] p-3 border rounded-lg">
              {data?.latest_remarks}
            </p>
          </div>
        </div>
      </div>
    </CustomeModal>
  );
};

export default ViewLeadModal;
