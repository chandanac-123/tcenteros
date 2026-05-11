import { useEffect, useState } from "react";
import { DataTable } from "@common/components/DataTable";
import {
  usePayrollQuery,
  useRunPayrollMutation,
  useCreatePayCycleMutation,
  usePayCyclesQuery,
} from "@api-queries/center-admin/employee-management/Query";
import { Button } from "@pages/components/ui/button";
import { ArrowBigRightDash } from "lucide-react";
import { Badge } from "@pages/components/ui/badge";
import { Input } from "@pages/components/ui/input";
import { useAppPermissions } from "@hooks/index";
const statusVariantMap = { paid: "active", unpaid: "inactive" };

const Payroll = () => {
  const { hydrated, canAddPayroll, canRunPayroll } = useAppPermissions();
  if (!hydrated) return null;
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: "",
  });
  const { data: payrollData, isFetching } = usePayrollQuery(tableParams);
  const { mutate: runPayroll, isPending: isRunning } = useRunPayrollMutation();
  const { data: payCycles } = usePayCyclesQuery();
  const { mutate: createPayCycle, isPending: isCreating } =
    useCreatePayCycleMutation();
  const [payrollCycleDay, setPayrollCycleDay] = useState("");
  const [initialCycleDay, setInitialCycleDay] = useState("");

  useEffect(() => {
    if (payCycles?.payroll_cycle_day) {
      const value = String(payCycles.payroll_cycle_day);
      setPayrollCycleDay(value);
      setInitialCycleDay(value);
    }
  }, [payCycles]);

  const columns = [
    { accessorKey: "employee_name", header: "Employee Name" },
    { accessorKey: "paid_date", header: "Paid Date" },
    { accessorKey: "payment_method", header: "Payment Method" },
    { accessorKey: "period", header: "Period" },
    { accessorKey: "deductions", header: "Deductions" },
    { accessorKey: "gross_salary", header: "Gross Salary" },
    { accessorKey: "net_salary", header: "Net Salary" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          label={row.original.status.replace("_", " ").toUpperCase()}
          variant={statusVariantMap[row.original.status] || "inactive"}
        />
      ),
    },
  ];

  const handleRunPayroll = async () => {
    try {
      await runPayroll(); // Wait for the payroll to run before fetching the updated data
    } catch (error) {}
  };

  const handleAddCycleDay = async () => {
    try {
      await createPayCycle({ payroll_cycle_day: Number(payrollCycleDay) });
      setPayrollCycleDay("");
    } catch (error) {}
  };

  const isSameValue = payrollCycleDay === initialCycleDay;
  const isDisabled = isSameValue || isCreating;
  return (
    <div className="flex gap-3 flex-col">
      <div className="flex justify-between">
        <Button
          size="addbutton"
          onClick={handleRunPayroll}
          disabled={isRunning || !canRunPayroll}
        >
          Run Payroll <ArrowBigRightDash />
        </Button>
        <div className="flex gap-2 justify-center items-center">
          <Input
            type="number"
            placeholder="Enter Pay Cycle Day"
            name="payroll_cycle_day"
            value={payrollCycleDay}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (Number(val) >= 1 && Number(val) <= 31)) {
                setPayrollCycleDay(val);
              }
            }}
          />
          <Button
            size="mini"
            onClick={handleAddCycleDay}
            disabled={isDisabled || !canAddPayroll}
          >
            Add Pay Run Day
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={payrollData?.payroll_records || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={payrollData?.total}
        paginationVisibile={true}
        loading={isFetching}
        search={false}
      />
    </div>
  );
};

export default Payroll;
