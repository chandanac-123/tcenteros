import React from "react";
import PartnerLayout from "./components/Layout";
import { Card } from "@pages/components/ui/card";
import { Button } from "@pages/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const PaymentSuccessfull = () => {
  const navigate = useNavigate();

  const accountDetails = [
    { label: "Reseller ID", value: "RSL - 2026-4656" },
    { label: "Territory", value: "Mumbai District" },
    { label: "Status", value: "Active", valueClassName: "text-[#09A61C]" },
    { label: "Activation Date", value: "04 - Mar - 2026" },
  ];

  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col overflow-y-auto bg-white px-7 py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#09A61C] text-white shadow-[0_12px_30px_rgba(9,166,28,0.22)]">
              <Check size={48} strokeWidth={3.2} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[20px] font-semibold text-[#121212] sm:text-[22px]">
                Payment Successful !
              </h1>
              <p className="text-sm font-medium text-[#202020]">
                Welcome to the Reseller Program
              </p>
            </div>
          </div>

          <Card className="border-none bg-[#F7F7F7] shadow-none">
            <div className="flex flex-col gap-2 p-6 ">
              <span className="text-lg font-semibold text-[#111111]">
                Your Account Details
              </span>

              <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-[minmax(160px,220px)_1fr] sm:gap-x-6">
                {accountDetails.map((item) => (
                  <React.Fragment key={item.label}>
                    <span className="text-[15px] font-normal text-[#303030]">
                      {item.label}
                    </span>
                    <span
                      className={`text-[15px] font-normal text-[#303030] sm:text-right ${item.valueClassName || ""}`}
                    >
                      {item.value}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex w-full justify-center">
            <Button
              size="addbutton"
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full justify-center"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PaymentSuccessfull;
