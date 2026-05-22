import PartnerLayout from "./components/Layout";
import HeaderProgress from "./components/HaederProgress";
import { Card } from "@pages/components/ui/card";
import { CircleCheck, MoveRight } from "lucide-react";
import { Button } from "@pages/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  usePaymentFeeQuery,
  useCreateOnboardingPaymentMutation,
} from "@api-queries/partner/on-boarding/Query";
import { useOnboardingStore } from "@store/onboardingStore";
import { useCreatePaymentOrder, useVerifyPayment } from "@api-queries/common/razorPay/query";
import { showError, showSuccess } from "@utils/toast";

const Payment = () => {
  const navigate = useNavigate();
  const partnerEmail = useOnboardingStore(
    (state) => state.partnerOnboardingDraft?.email,
  );
  const { data } = usePaymentFeeQuery(partnerEmail);
  const onboardId = useOnboardingStore((state) => state.onboardId);
  const { mutateAsync: createOnboardingPayment } =
    useCreateOnboardingPaymentMutation();
  const { mutate: create_Order, isPendings } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();

  const handlePayment = async () => {
    try {
      const response = await createOnboardingPayment(onboardId);
      // navigate("/payment-successful", { state: { paymentResponse: response }
      // const  });
      console.log("response", response?.onboarding_id);
      const payment_id = response?.onboarding_id;
      if (!payment_id) {
        showError("Payment ID not found .");
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


    } catch (error) {
      console.log("Payment initiation failed: ", error);
    }
  };

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
            // await refetchWalletAmount();
            // await refetchWalletSummary();
            // setOpenSuccess(true)
            navigate("/dashbaord", { state: { paymentResponse: response }})
            showSuccess("Partner Payment received successfully")
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
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={3} />
        <div className="flex flex-col p-8 gap-4">
          <Card>
            <div className="flex flex-col p-8">
              <span className="flex text-md font-semibold">
                Complete Payment
              </span>
              <div className="flex bg-grey/5 justify-between items-center p-6 rounded-lg mt-4">
                <div>
                  <span className="flex text-md font-semibold">
                    Onboarding Fee
                  </span>
                  <span className="flex text-md ">
                    One-time registration fee to activate your reseller account
                  </span>
                </div>
                <div className="flex text-base font-medium text-onboard_primary">
                  ₹{data?.onboarding_fee}
                </div>
              </div>

              <div className="flex bg-grey/5  items-center p-6 rounded-lg mt-4">
                <div className="flex flex-col gap-2">
                  <span className="flex text-md font-semibold">
                    What you get after payment:
                  </span>
                  <div className="flex flex-col px-8">
                    <span className="flex text-md text-textgrey gap-2">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Instant access to reseller dashboard
                    </span>
                    <span className="flex text-md text-textgrey gap-2">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Unique Reseller ID and territory assignment
                    </span>
                    <span className="flex text-md text-textgrey gap-2">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Sales materials and training resource
                    </span>
                    <span className="flex text-md text-textgrey gap-2 ">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Start receiving leads immediately
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <div className="flex w-full justify-center md:col-span-2">
            <Button
              size="addbutton"
              type="submit"
              onClick={handlePayment}
              className="w-full justify-center bg-[#088217] hover:bg-[#088217]"
            >
              Pay ₹ {data?.onboarding_fee} & Activate Account
            </Button>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default Payment;
