import CustomeTab from "@common/components/CustomeTab";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import { Plus, UserCog } from "lucide-react";
import React, { useState } from "react";
import EmployeeTab from "./components/EmployeeTab";
import PermissionTabs from "./components/PermissionTabs";
import AddEmployee from "./components/AddEmployee";

const RoleAndPermissions = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");

  const permissionTabs = [
    { id: "employees", name: "Employees", component: <EmployeeTab /> },
    { id: "permission", name: "Permissions", component: <PermissionTabs /> },
  ];

  const activeModule = permissionTabs.find(
    (item) => item.id === activeTab
  );

  return (
    <ContentLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-4">
          <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <UserCog
              size={24}
              className="text-onboard_primary sm:w-[30px] sm:h-[30px]"
            />
          </div>

          <div className="flex flex-col justify-center gap-1 sm:gap-2">
            <h1 className="text-base sm:text-[18px] font-semibold text-[#3A3A3A]">
              Roles & Permissions
            </h1>

            <p className="text-xs sm:text-[14px] font-medium text-[#393636]">
              Manage reseller partners and commissions
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-2 sm:px-5 w-full lg:w-auto">
          <Button
            size="addbutton"
            className="w-full lg:w-auto justify-center"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create New Designation
          </Button>

          <AddEmployee open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-2 sm:px-4 overflow-x-auto">
        <CustomeTab
          tabList={permissionTabs}
          value={activeTab}
          defaultVal="employees"
          onChange={setActiveTab}
          tabsClass="w-full sm:w-[50%] lg:w-[30%] min-w-max"
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeModule?.component}
      </div>
    </ContentLayout>
  );
};

export default RoleAndPermissions;