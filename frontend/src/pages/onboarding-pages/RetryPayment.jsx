import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import { Button } from "@pages/components/ui/button";
import OnboardHeader from "./components/OnboardHeader";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCalculateGstQuery,
  useRazorpayFailure,
  useRetryPaymentMutation,
} from "@api-queries/center-admin/on-boarding/Query";
import { useFormik } from "formik";
import { Spinner } from "@pages/components/ui/spinner";
import { useState } from "react";
import {
  useCreatePaymentOrder,
  useVerifyPayment,
} from "@api-queries/common/razorPay/query";
import { useOnboardingStore } from "@store/onboardingStore";

const RetryPayment = () => {
  const navigate = useNavigate();
  const { onboardId, paymentId } = useParams();
  const [success, setSuccess] = useState(false);
  const resetStore = useOnboardingStore((state) => state.resetStore);
  const { data, isFetching } = useCalculateGstQuery(onboardId);
  const { mutateAsync: retryPayment, isLoading } = useRetryPaymentMutation(
  );
  const { mutate: create_Order, isPending } = useCreatePaymentOrder();
  const { mutateAsync: razorpayFailure } = useRazorpayFailure();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const phoneNumber = data?.center_phone;

  const formik = useFormik({
    initialValues: {},
    enableReinitialize: true,
    onSubmit: async () => {
      try {
        await retryPayment({ onboardId, paymentId });
        create_Order(paymentId, {
          onSuccess: (res) => {
            const orderData = res?.data;
            openRazorpay(orderData);
          },
          onError: (err) => {
          },
        });
      } catch (error) {
      }
    },
  });

  const openRazorpay = async (orderData) => {
    try {
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TcenterOS",
        description: "Network Center Wallet Payment",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccess(true);
            navigate("/dashboard");
            resetStore();

          } catch (error) {
            await razorpayFailure(paymentId);
          }
        },

        prefill: {
          contact: phoneNumber,
        },

        modal: {
          ondismiss: async () => {

            try {
              await razorpayFailure(paymentId);
            } catch (error) {
            }

          },
        },
      };

      const razor = new window.Razorpay(options);

      razor.on("payment.failed", async (response) => {
        try {
          await razorpayFailure(paymentId);
        } catch (error) {
        }

      });

      razor.open();
    } catch (err) {
      try {
        await razorpayFailure(paymentId);
      } catch (error) {
      }
    }
  };

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <div className="px-4 sm:px-10 ">
        {success && (
          <p className="text-green-600 text-center mt-2">
            Payment successful! Redirecting...
          </p>
        )}
        <div className="flex justify-center">
          {isFetching ? (
            <Spinner />
          ) : (
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] p-4 w-full max-w-lg  ">
              {/* Header */}
              <h2 className="text-xl font-semibold text-center mb-4">
                Billing Summary
              </h2>


              {/* Center Details */}
              <section className="mb-6">
                <h3 className="font-semibold mb-1">Center Details</h3>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Center Name</span>
                    <span className="font-medium">{data?.center_name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Contact</span>
                    <span className="font-medium">{data?.center_phone}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">City</span>
                    <span className="font-medium">{data?.city}</span>
                  </div>
                </div>

                <form
                id="retry-payment-form"
                  className="space-y-1 mt-2"
                  onSubmit={formik.handleSubmit}
                >
                  <section className="mb-2">
                    <h3 className="font-semibold mb-1">Package Details</h3>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        White-Label Offline + Live Classes package (1 year)
                      </span>
                      <span className="font-medium">
                        {data?.total_base_price
                          ? `₹${data?.total_base_price.toFixed(2)}`
                          : "₹00.00"}
                      </span>
                    </div>
                  </section>

                  {/* Bill Breakdown */}
                  <section className="mb-6">
                    <h3 className="font-semibold mb-1">Detailed Bill Breakdown</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base price (1 year)</span>
                        <span>
                          {data?.total_base_price
                            ? `₹${data?.total_base_price.toFixed(2)}`
                            : "₹00.00"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          GST ({data?.tax?.tax_percentage}%)
                        </span>
                        <span>
                          {data?.total_tax
                            ? `₹${data?.total_tax.toFixed(2)}`
                            : "₹00.00"}
                        </span>
                      </div>
                    </div>
                  </section>

                  <div className="flex justify-between items-end space-y-8">
                    <div>
                      <p className="font-semibold">Total Amount Payable</p>
                      <p className="text-xs text-gray-400">
                        (Include all payable taxes)
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {data?.total_amount
                        ? `₹${data?.total_amount.toFixed(2)}`
                        : "₹00.00"}
                    </p>
                  </div>
                </form>
              </section>


              {/* Actions */}
              <div className="flex justify-center gap-3 mt-4">
                <Button
                form="retry-payment-form"
                  type="submit"
                  variant="onboard_button_filled"
                  className="w-1/2"
                  size="sm"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </SecondaryLayout>
  );
};

export default RetryPayment;
