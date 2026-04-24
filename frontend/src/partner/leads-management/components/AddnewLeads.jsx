import ContentLayout from "@common/MasterLayout/ContentLayout";
import { UserRoundPlus } from "lucide-react";
import React from "react";
import AddLeadsFields from "./AddLeadsFields";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";
import { useNavigate } from "react-router-dom";

const AddnewLeads = () => {
  const navigate = useNavigate();
  return (
    <ContentLayout>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <UserRoundPlus size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Add New Lead
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Manually enter a new lead into the system
              </p>
              <CustomeBreadcrumb
                goBack={() => navigate("/lead-management")}
                buttonName="Lead Management list"
                currentPageName="Add New Lead"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <AddLeadsFields />
      </div>
    </ContentLayout>
  );
};

export default AddnewLeads;
