import CustomeModal from "@common/components/CustomeModal";
import CustomeSelect from "@common/components/CustomeSelect";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import { useFormik } from "formik";
import { useState } from "react";

const subscriptionType = [
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

const RenewSubscription = ({ open, setOpen }) => {
  const [showUpgradeFields, setShowUpgradeFields] = useState(false);

  const formik = useFormik({
    initialValues: {
      subscription_duration: "",
      price: "",
      plan_type: "",
    },
    onSubmit: async (values) => {
      try {
        console.log("FORM VALUES 👉", values);

        // 👉 Call API here

        setOpen(false);
        setShowUpgradeFields(false);
        formik.resetForm();
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
      <form className="space-y-5" onSubmit={formik.handleSubmit}>
        {/* CURRENT PLAN */}
        <div className="rounded-xl border bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold">
            Current Subscription Details
          </h3>

          <div className="space-y-2 text-sm">
            {currentPackageDetails.map((item) => (
              <div key={item.label} className="flex justify-between gap-4">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INFO TEXT */}
        <p className="text-sm text-gray-500">
          Continue with your current plan or upgrade before proceeding to
          payment.
        </p>

        {/* UPGRADE SECTION */}
        {showUpgradeFields && (
          <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-white">
            <CustomeSelect
              label="Subscription Duration"
              name="subscription_duration"
              options={subscriptionType}
              value={formik.values.subscription_duration}
              onChange={(value) =>
                formik.setFieldValue("subscription_duration", value)
              }
              placeholder="Select duration"
            />

            <Input
              label="Price"
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              placeholder="Enter price"
            />

            <div className="col-span-2">
              <Input
                label="Plan Type"
                name="plan_type"
                value={formik.values.plan_type}
                onChange={formik.handleChange}
                placeholder="e.g. Premium / Enterprise"
              />
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center">
          <Button
            size="addbutton"
            type="button"
            variant="button_filter"
            onClick={() => setShowUpgradeFields((prev) => !prev)}
          >
            {showUpgradeFields ? "Cancel Upgrade" : "Upgrade Plan"}
          </Button>

          <Button type="submit" size="addbutton">
            {showUpgradeFields ? "Upgrade & Pay" : "Renew & Pay"}
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default RenewSubscription;
