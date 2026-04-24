import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Handshake } from "lucide-react";
import React, { useState } from "react";
import PartnerDisplay from "./components/PartnerDisplay";
import PartnerCards from "./components/PartnerCards";
import CustomeTab from "@common/components/CustomeTab";
import AssiginedCenters from "./components/AssignedCenters/AssiginedCenters";
import CommissionLedger from "./components/CommissionLedger/CommissionLedger";
import CustomFilter from "@common/components/CustomeFilter";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";
import { useNavigate } from "react-router-dom";

const PartnerById = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("center_assigned");
  const partnerTabs = [
    {
      id: "center_assigned",
      name: "Center Assigned",
      component: <AssiginedCenters />,
    },
    {
      id: "commission_ledger",
      name: "Commission Ledger",
      component: <CommissionLedger />,
    },
  ];
  const activeModule = partnerTabs.find((item) => item.id === activeTab);
  const assignedCenterFilter = [
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  return (
    <ContentLayout>
      <div>
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Handshake size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Partners Management
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Manage reseller partners and commissions
              </p>
              <CustomeBreadcrumb
                goBack={() => navigate("/partners")}
                buttonName="Partner Management list"
                currentPageName="Partner Details"
              />
            </div>
          </div>

          {/* <div className="pe-5">
                    <Button size="addbutton" onClick={() => setOpen(true)}>
                        <CircleArrowDown />
                        Export Report
                    </Button>
                </div> */}
        </div>

        <div className="px-5 flex flex-col gap-5">
          <PartnerDisplay />
          <PartnerCards />
        </div>

        <div className="px-5 py-5">
          <div className=" flex items-center justify-between">
            <CustomeTab
              tabList={partnerTabs}
              value={activeTab}
              defaultVal="center_assigned"
              onChange={setActiveTab}
              tabsClass={"w-[50%]"}
            />
            {activeTab === "center_assigned" && (
              <CustomFilter options={assignedCenterFilter} />
            )}
          </div>

          <div className="mt-4">{activeModule?.component}</div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default PartnerById;
