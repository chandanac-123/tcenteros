import CustomeModal from "@common/components/CustomeModal";
import logo from "@assets/header-icons/logo_in_auth.svg";
import { Button } from "@pages/components/ui/button";
import { useEffect, useState } from "react";
import { useAddBranchCountMutation } from "@api-queries/center-admin/branch/Query";
import { useGetBranchPricesAndTaxQuery } from "@api-queries/center-admin/branch/Query";
import SuccessModal from "../message-popup/success";
import FaledModal from "../message-popup/failed";
import { useNavigate } from "react-router-dom";
import { useSettingsTabStore } from "@store/tabStore";
import {
  useCreatePaymentOrder,
  useVerifyPayment,
} from "@api-queries/common/razorPay/query";
import { showError } from "@utils/toast";

const AddBranchModal = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { setSelectedTab } = useSettingsTabStore();
  const [count, setCount] = useState(0);
  const { mutateAsync: addCount, isPending } = useAddBranchCountMutation();
  const { data, isLoading, refetch } = useGetBranchPricesAndTaxQuery();
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const { mutate: create_Order, isPendings } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();

  const branchingPrice = data?.branching_price || 0;
  const taxPercentage = data?.tax_percentage || 0;

  // subtotal for selected branches
  const subtotal = count * branchingPrice;
  // tax amount
  const taxAmount = (subtotal * taxPercentage) / 100;
  // total payable
  const totalAmount = subtotal + taxAmount;

  useEffect(() => {
    if (open) {
      refetch();
      setCount(0);
    }
  }, [open]);

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  const decrement = () => {
    setCount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handlePurchase = async () => {
    try {
      const payload = {
        branch_count: count,
      };
      const response = await addCount(payload);
      console.log("count success:", response);
      const payment_id = response?.payment_order_id;
      console.log("Pay", payment_id);

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
          const message = err?.response?.data?.detail;
          showError(message);
        },
      });
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  const openRazorpay = async (orderData) => {
    onOpenChange(false);
    try {
      const options = {
        key: orderData.key_id, // from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TcenterOS",
        description: "Branch purchase Payment",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!result || result.error) {
              showError("Payment Verification is Failed");
              onOpenChange(true);
              setOpenFailed(true);
            }
          } catch (err) {
            onOpenChange(true);
          }
        },
      };

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", function (response) {
        console.log("Payment Failed:", response);

        showError(response.error.description || "Payment Failed");
      });
      razor.open();
    } catch (err) {
      console.log("Error at opening razor Pay checkOut", err);
    }
  };

  return (
    <CustomeModal open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col space-y-4 w-full">
        <h2 className="text-sm font-semibold">Purchase Branches</h2>
        {data?.tax_percentage === 0 && (
          <p className="flex justify-center items-center text-red_text">
            Purchase branch tax is currently 0%. You can add a Purchase Tax in
            Tax Settings if required, otherwise it will continue as 0%.
            <Button
              variant="link"
              onClick={() => {
                setSelectedTab(1);
                navigate("/settings");
                onOpenChange(false);
              }}
            >
              Go to Tax Settings
            </Button>
          </p>
        )}
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-2 py-3">
            <p className="text-[14px] text-[#7C7C7C]">Branch Price</p>
            <div className="flex border text-primary px-4 py-1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] gap-3">
              <p>Branch</p>
              <p> ₹{data?.branching_price}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-[14px] text-[#7C7C7C]">No. of Branches</p>

            <div className="flex justify-around gap-1 ">
              <button
                onClick={decrement}
                className="px-3 py-1 text-lg border rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold text-primary hover:bg-purple-50 transition"
              >
                −
              </button>

              <div className="px-4 py-1 flex items-center rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold min-w-[40px] text-center">
                {count}
              </div>

              <button
                onClick={increment}
                className="px-3 py-1 text-lg border rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold text-primary  hover:bg-purple-50 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <h2 className="font-semibold">Purchase Summary</h2>
          <div className="flex justify-between items-center">
            <p className="text-[14px] text-[#7C7C7C]">Cost Per Branch: </p>
            <p>₹{data?.branching_price}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[14px] text-[#7C7C7C]">Selected Branches: </p>
            <p>₹{subtotal}</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-[14px] text-[#7C7C7C]">Tax</p>
            <p>₹{taxAmount}</p>
          </div>
          <hr className="border-t-2 border-gray-300" />

          <div className="flex justify-between items-center">
            <p className="text-[14px] text-[#7C7C7C]">Total Amount</p>
            <p className="font-semibold">₹{totalAmount}</p>
          </div>
          <div className="py-3">
            <Button
              variant="button_filled"
              size="sm"
              className="w-full"
              onClick={handlePurchase}
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Proceed to Payment"}
            </Button>
            {/* <RazorpayButton
                amount={50000} // ₹500
                onSuccess={handleSuccess}
                onFailure={handleFailure}
              /> */}
          </div>
        </div>
      </div>
      <SuccessModal
        open={openSuccess}
        onOpenChange={setOpenSuccess}
        count={count}
      />
      <FaledModal open={openFailed} onOpenChange={setOpenFailed} />
    </CustomeModal>
  );
};

export default AddBranchModal;
