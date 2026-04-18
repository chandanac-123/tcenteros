import CustomeTab from "@common/components/CustomeTab";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import { Plus, UserCog } from "lucide-react";
import React, { useState } from "react";
import EmployeeTab from "./components/EmployeeTab";
import PermissionTabs from "./components/PermissionTabs";
import AddDesignation from "./components/AddDesignation";

const RoleAndPermissions = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const permissionTabs = [
    { id: "employees", name: "Employees", component: <EmployeeTab /> },
    { id: "permission", name: "Permissions", component: <PermissionTabs /> },
  ];
  const activeModule = permissionTabs.find((item) => item.id === activeTab);

  return (
    <ContentLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <UserCog size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Roles & Permissions
            </h1>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Manage reseller partners and commissions
            </p>
          </div>
        </div>
        <div className="pe-5">
          <Button size="addbutton" onClick={() => setOpen(true)}>
            <Plus />
            Create New Designation
          </Button>
          <AddDesignation open={open} setOpen={setOpen} />
        </div>
      </div>

      <div className="px-4">
        <CustomeTab
          tabList={permissionTabs}
          value={activeTab}
          defaultVal="employees"
          onChange={setActiveTab}
          tabsClass={"w-[50%]"}
        />
      </div>
      <div className="mt-4">{activeModule?.component}</div>
    </ContentLayout>
  );
};

export default RoleAndPermissions;
