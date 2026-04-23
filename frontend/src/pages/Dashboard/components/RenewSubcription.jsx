import { useRenewSubscriptionQuery } from "@api-queries/center-admin/Dashboard/Query";
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

const RenewSubscription = ({ open, setOpen }) => {
  const [showUpgradeFields, setShowUpgradeFields] = useState(false);
  const { data, isLoading } = useRenewSubscriptionQuery();
  console.log("data: ", data);
  const currentPackageDetails = [
    {
      label: "Billing Cycle",
      value: data?.pricing_options?.selected_subscription_duration || "N/A",
    },
    { label: "Expiry Date", value: data?.expiry_info?.latest_end_date },
    {
      label: "Amount Paid",
      value: data?.pricing_options?.total_amount_payable,
    },
  ];
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
           hhj

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
