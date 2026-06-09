import {
  useRenewSubscriptionQuery,
  useChangeSubscriptionMutation,
  useUpdateSubscriptionDetailsQuery,
} from "@api-queries/center-admin/Dashboard/Query";
import { useCreatePaymentOrder, useVerifyPayment } from "@api-queries/common/razorPay/query";
import CustomeModal from "@common/components/CustomeModal";
import FaledModal from "@pages/branch/message-popup/failed";
import SuccessModal from "@pages/branch/message-popup/success";
import { Button } from "@pages/components/ui/button";
import { formatTextDate } from "@utils/helper";
import { showError, showSuccess } from "@utils/toast";
import { useFormik } from "formik";
import { useState } from "react";

const RenewSubscription = ({ open, setOpen }) => {
  const [showUpgradeFields, setShowUpgradeFields] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const { data, isLoading } = useRenewSubscriptionQuery();
  const { mutateAsync: changeSubscription } = useChangeSubscriptionMutation();
  const { mutate: create_Order, isPendings } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();

  const currentSubscriptionDuration =
    data?.pricing_options?.selected_subscription_duration || "";

  const upgradedSubscriptionDuration =
    currentSubscriptionDuration === "yearly"
      ? "monthly"
      : currentSubscriptionDuration === "monthly"
        ? "yearly"
        : "";

  const { data: updateSubscriptionData } = useUpdateSubscriptionDetailsQuery(
    upgradedSubscriptionDuration,
  );

  const currentPackageDetails = [
    {
      label: "Billing Cycle",
      value: currentSubscriptionDuration || "N/A",
    },
    {
      label: "Expiry Date",
      value: formatTextDate(data?.expiry_info?.latest_end_date) || "N/A",
    },
    {
      label: "Amount Paid",
      value: data?.pricing_options?.total_amount_payable?.toFixed(2) || "N/A",
    },
  ];

  const initialValues = {
    subscription_duration: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async () => {
      try {
        const subscriptionDuration = showUpgradeFields
          ? upgradedSubscriptionDuration
          : currentSubscriptionDuration;

        console.log("FORM subscription_duration 👉", subscriptionDuration);
        const response = await changeSubscription({
          subscription_duration: subscriptionDuration,
        });

        console.log('Response', response);
        const payment_id = response?.payment_order?.payment_order_id;
        if (!payment_id) {
          throw new Error("Payment ID not found .");
        }
        create_Order(payment_id, {
          onSuccess: (res) => {
            console.log("Order ID:", res);
            const orderData = res?.data;
            openRazorpay(orderData);
          },
          onError: (err) => {
            console.error(err?.response?.data?.detail);
            const message = err?.response?.data?.detail
            showError(message)
          },
        });
        setOpen(false);
        setShowUpgradeFields(false);
        formik.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
  });


  const openRazorpay = async (orderData) => {
    // setOpen(false);
    try {
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TcenterOS",
        description: "Branch purchase Payment",
        order_id: orderData.order_id,

        handler: async function (response) {
          try {
            console.log("Payment Success:", response);
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // setOpen(true);
            if (!result || result.error) {
              showError("Payment Verification is Failed");
              // setOpen(true);
              // setOpenFailed(true);
            }
            console.log("Verified Result:", result);
            // setOpenSuccess(true)
            showSuccess("Subscription Renewed successfully")
          } catch (err) {
            console.log("Verification Error:", err);
            // setOpen(true);
            // setOpenFailed(true);
          }
        },

        // prefill: {
        //   name: "Customer Name",
        //   email: "customer@email.com",
        // },

        // theme: {
        //   color: "#6D28D9",
        // },
      };

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", function (response) {
        console.log("Payment Failed:", response);
        // onOpenChange(true);
        // setOpenFailed(true);
        showError(response.error.description || "Payment Failed");
      });
      razor.open();
    } catch (err) {
      console.log("Error at opening razor Pay checkOut", err);
    }
  };


  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header="Renew Subscription"
      className="w-[95vw] max-w-xl"
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
                <span className="text-gray-500 ">{item.label}</span>
                <span className="font-medium capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INFO TEXT
        <p className="text-sm text-gray-500">
          Continue with your current plan or upgrade before proceeding to
          payment.
        </p> */}

        {/* UPGRADE SECTION */}
        {showUpgradeFields && (
          <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-white">
            <div className="col-span-2 flex items-center justify-between gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">
                Upgrade billing cycle
              </span>
              <span className="text-sm font-medium capitalize text-onboard_primary">
                {upgradedSubscriptionDuration || "N/A"}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-4 px-4">
              <span className="text-sm text-gray-500">
                Expiry date with upgraded plan
              </span>
              <span className="text-sm font-medium capitalize text-onboard_primary">
                {formatTextDate(updateSubscriptionData?.expiry_date) || "N/A"}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-4 px-4">
              <span className="text-sm text-gray-500">
                Total amount payable with upgraded plan
              </span>
              <span className="text-sm font-medium capitalize text-onboard_primary">
                {updateSubscriptionData?.total_amount_paid || "N/A"}
              </span>
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

      <SuccessModal
        open={openSuccess}
        onOpenChange={setOpenSuccess}
      />
      <FaledModal open={openFailed} onOpenChange={setOpenFailed} />
    </CustomeModal>
  );
};

export default RenewSubscription;
