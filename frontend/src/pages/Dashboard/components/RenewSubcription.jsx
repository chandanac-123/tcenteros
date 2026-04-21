import CustomeModal from "@common/components/CustomeModal";
import CustomeSelect from "@common/components/CustomeSelect";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import { useFormik } from "formik";
import { useState } from "react";

const subcriptionType = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const currentPackageDetails = [
  { label: "Plan Name", value: "White-Label Offline + Live Classes" },
  { label: "Billing Cycle", value: "Yearly" },
  { label: "Start Date", value: "22 Jan 2025" },
  { label: "Expiry Date", value: "21 Jan 2026" },
  { label: "Amount Paid", value: "₹24,900.00" },
];

const RenewSubcription = ({ open, setOpen }) => {
  const [showUpgradeFields, setShowUpgradeFields] = useState(false);

  const initialValues = {
    subcription_duration: "",
    salary: "",
    salary_type: null,
    pay_cycle: null,
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        formik.resetForm();
        setShowUpgradeFields(false);
        setOpen(false);
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header="Renew Subscription"
      className="max-w-xl w-full"
    >
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Current Subscription Details
          </h3>
          <div className="space-y-2 text-sm text-slate-700">
            {currentPackageDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4"
              >
                <span className="text-slate-500">{item.label}</span>
                <span className="text-right font-medium text-slate-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <span className="flex text-sm text-onboard_secondary">
          Continue with current plan or upgrade before paying.
        </span>
        {showUpgradeFields && (
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomeSelect
                label="Subscription Duration"
                name="subcription_duration"
                options={subcriptionType}
                value={formik.values.subcription_duration}
                onChange={(value) =>
                  formik.setFieldValue("subcription_duration", value)
                }
                error={
                  formik.touched.subcription_duration &&
                  formik.errors.subcription_duration
                }
                placeholder="Select Subscription Duration"
              />
              <CustomeSelect
                label="key"
                name="pay_cycle"
                //   placeholder="Select Pay Cycle"
                //   options={payCycleOptions}
                //   value={formik.values.pay_cycle}
                //   onChange={(value) => formik.setFieldValue("pay_cycle", value)}
                //   error={formik.touched.pay_cycle && formik.errors.pay_cycle}
              />
            </div>
            <div className="flex-1">
              <Input
                label="key"
                name="salary"
                //   value={formik.values.salary}
                //   onChange={formik.handleChange}
                //   error={formik.touched.salary && formik.errors.salary}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button
            size="addbutton"
            type="button"
            onClick={() => setShowUpgradeFields(!showUpgradeFields)}
          >
            {showUpgradeFields
              ? "Hide upgrade options"
              : "Upgrade subscription"}
          </Button>
          <Button size="addbutton" type="submit">
            Proceed to Pay
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default RenewSubcription;
