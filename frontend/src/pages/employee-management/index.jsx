import { useState } from "react";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import CustomeTab from "@common/components/CustomeTab";
import SalaryStructure from "./salary-structure";
import Employee from "./employee";
import AddEditForm from "./employee/AddEditForm";
import StructureAddEdit from "./salary-structure/AddEdit";
import Payroll from "./payroll";
import { useAppPermissions } from "@hooks/index";

const EmployeeManagement = () => {
  const { hydrated, canAddEmployee, canAddSalary } = useAppPermissions();
  if (!hydrated) return null;

  const tabConfig = [
    { id: "employee", name: "Employee" },
    { id: "salary_structure", name: "Salary Structure" },
    { id: "payroll", name: "Payroll" },
  ];

  const employeeOrCenter = tabConfig.filter((tab) => tab.id);
  const defaultTab = employeeOrCenter[0]?.id || null;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [open, setOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <ContentLayout>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex flex-col">
          <span className="text-lg font-semibold">Employees</span>
          <span className="text-textgrey text-sm">
            All Employees and Trainee Details
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2 w-full lg:w-auto">
          {activeTab === "employee" && (
            <Button
              onClick={handleOpen}
              disabled={!canAddEmployee}
              size="addbutton"
              className="w-full sm:w-auto justify-center"
            >
              + Add Employee
            </Button>
          )}

          {activeTab === "salary_structure" && (
            <Button
              onClick={() => setStructureOpen(true)}
              disabled={!canAddSalary}
              size="addbutton"
              className="w-full sm:w-auto justify-center"
            >
              + Add Salary Structure
            </Button>
          )}
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="flex flex-col gap-4 mt-4 w-full overflow-hidden">
        <CustomeTab
          tabList={employeeOrCenter}
          defaultVal={employeeOrCenter[0]?.id}
          tabsListClass="w-full sm:w-[400px] max-w-full p-[1px]"
          onChange={(value) => setActiveTab(value)}
        />

        {activeTab === "employee" && (
          <Employee
            open={open}
            setOpen={setOpen}
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}

        {activeTab === "salary_structure" && <SalaryStructure />}

        {activeTab === "payroll" && <Payroll />}

        <AddEditForm
          open={open}
          setOpen={setOpen}
          closeModal={() => setOpen(false)}
        />

        <StructureAddEdit
          open={structureOpen}
          setOpen={setStructureOpen}
          closeModal={() => setStructureOpen(false)}
        />
      </div>
    </ContentLayout>
  );
};

export default EmployeeManagement;