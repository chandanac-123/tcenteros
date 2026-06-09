import PartnerLayout from "./components/Layout";
import HeaderProgress from "./components/HaederProgress";
import { Card } from "@pages/components/ui/card";
import { CircleCheck } from "lucide-react";
import { Button } from "@pages/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import {
  usePaymentFeeQuery,
} from "@api-queries/partner/on-boarding/Query";
import { useOnboardingStore } from "@store/onboardingStore";
import {
  useCreatePaymentOrder,
  useVerifyPayment,
} from "@api-queries/common/razorPay/query";
import { showError, showSuccess } from "@utils/toast";
import { usePartnerRazorpayFailure, useRetryPaymentMutation } from "@api-queries/center-admin/on-boarding/Query";

const PaymentRetry = () => {
  const navigate = useNavigate();
  const { onboardId, paymentId } = useParams();
  const partnerEmail = useOnboardingStore(
    (state) => state.partnerOnboardingDraft?.email,
  );
  const resetPartnerOnboardingDraft = useOnboardingStore(
    (state) => state.resetPartnerOnboardingDraft,
  );
  const { data } = usePaymentFeeQuery(partnerEmail);
  console.log('data: ', data);
  const { mutateAsync: razorpayFailure } = usePartnerRazorpayFailure();
  const { mutate: create_Order, isPendings } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const { mutateAsync: retryPayment, isLoading } = useRetryPaymentMutation(
  );

  const handlePayment = async () => {
    try {
      await retryPayment({ onboardId, paymentId });
      create_Order(paymentId, {
        onSuccess: (res) => {
          console.log("Order ID:", res);
          const orderData = res?.data;
          openRazorpay(orderData,paymentId);
        },
        onError: (err) => {
          console.error(err?.response?.data?.detail);
          const message = err?.response?.data?.detail;
          showError(message);
        },
      });
    } catch (error) {
      console.log("Payment initiation failed: ", error);
    }
  };

  const openRazorpay = async (orderData) => {
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
            if (!result || result.error) {
              showError("Payment Verification is Failed");

            }
            console.log("Verified Result:", result)
            resetPartnerOnboardingDraft();
            navigate("/dashboard", { state: { paymentResponse: response } });
            showSuccess("Partner Payment received successfully");
          } catch (err) {
            console.log("Verification Error:", err);
            await razorpayFailure(paymentId);

          }
        },

        // prefill: {
        //   contact: phoneNumber,
        // },

        modal: {
          ondismiss: async () => {
            console.log("User closed Razorpay popup");
            try {
              await razorpayFailure(paymentId);
            } catch (error) {
              console.error("Failure API Error:", error);
            }

          },
        },
      };

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", async (response) => {
        console.error("Payment Failed:", response.error);
        try {
          await razorpayFailure(paymentId);
        } catch (error) {
          console.error("Failure API Error 1:", error);
        }
      });

      razor.open();
    } catch (err) {
      console.error("Error opening Razorpay:", err);
      try {
        await razorpayFailure(paymentId);
      } catch (error) {
        console.error("Failure API Error: 2", error);
      }
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

export default PaymentRetry;
