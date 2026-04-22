import React from "react";
import { FileText, CreditCard, NotebookText } from "lucide-react";

const steps = [
  { id: 1, label: "Detail", icon: FileText },
  { id: 2, label: "Agreement", icon: NotebookText },
  { id: 3, label: "Payment", icon: CreditCard },
];

const HeaderProgress = ({ currentStep = 1 }) => {
  const safeStep = Math.min(Math.max(currentStep, 1), steps.length);
  const progressWidth = `${((safeStep - 1) / (steps.length - 1)) * 80}%`;

  return (
    <>
      <span className="flex px-5 text-xl text-onboard_primary font-semibold">
        Reseller Registration
      </span>

      <div className="w-full flex items-center justify-center bg-white py-5">
        <div className="relative w-full max-w-5xl px-4 sm:px-8 ">
          <div className="absolute left-[10%] right-[10%] top-8 h-[2px] bg-[#D9D9D9]" />
          <div
            className="absolute left-[10%] top-8 h-[2px] bg-[#1D5FE9] transition-all duration-300"
            style={{
              width: progressWidth,
            }}
          />

          <div className="relative z-10 flex items-start justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = safeStep >= step.id;
              const isCurrent = safeStep === step.id;

              return (
                <div
                  key={step.id}
                  className="flex w-20 flex-col items-center text-center sm:w-28"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all sm:h-16 sm:w-16
                ${
                  isActive
                    ? "border-[#1D5FE9] bg-[#1D5FE9] text-white shadow-[0_4px_10px_rgba(29,95,233,0.18)]"
                    : "border-[#D6D6D6] bg-[#D9D9D9] text-white"
                }`}
                  >
                    <Icon size={28} strokeWidth={2.2} />
                  </div>

                  <span
                    className={`mt-2 text-[12px] leading-none sm:text-[13px] ${
                      isCurrent
                        ? "font-medium text-[#1F1F1F]"
                        : "font-normal text-[#4B4B4B]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderProgress;
