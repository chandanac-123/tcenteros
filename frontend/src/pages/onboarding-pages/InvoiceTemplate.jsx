import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import OnboardHeader from "./components/OnboardHeader";
import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import { Button } from "@pages/components/ui/button";
import backarrow from "@assets/navigate-icons/backarrow.svg";
import { Download, FileText, ReceiptIndianRupee } from "lucide-react";

const InvoiceTemplate = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const centerDetailsRef = useRef(null);
  const billingSummaryRef = useRef(null);

  const invoiceMeta = {
    invoiceId: "#848904",
    date: "Jan 22, 2026, 11:45 am",
  };

  const centerDetails = [
    { label: "Center Name", value: "Fitrex" },
    { label: "Contact Number", value: "+91 9876543210" },
    {
      label: "Address",
      value: "Plot no 04, behind DAV Public School, Katol Road, Nagpur",
    },
    { label: "Pincode", value: "441501" },
    { label: "GST Number", value: "GST441501" },
  ];

  const billingLines = [
    {
      label: "White-Label Offline + Live Classes package (1 year)",
      value: "₹24,900.00",
    },
  ];

  const breakdownLines = [
    { label: "Base price (1 year)", value: "₹24,900.00" },
    { label: "GST (18%)", value: "₹4,482.00" },
  ];

  const handleDownload = () => {
    window.print();
  };

  return (
    <SecondaryLayout>
      <div className="min-h-screen overflow-y-auto px-4 pb-8 pt-6 sm:px-6 print:overflow-visible print:bg-white print:p-0">
        <div className="mx-auto flex max-w-5xl justify-center print:max-w-none">
          <div
            ref={cardRef}
            className="w-full max-w-4xl rounded-[28px] bg-white px-5 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] sm:px-8 sm:py-8 print:rounded-none print:shadow-none"
          >
            <div className="mb-2 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <OnboardHeader />

              <div className=" px-5 py-4 text-left text-sm text-slate-600 sm:min-w-[240px] sm:text-right print:border print:bg-white">
                <p className="mb-2">
                  Invoice id :{" "}
                  <span className="font-semibold text-slate-900">
                    {invoiceMeta.invoiceId}
                  </span>
                </p>
                <p>
                  Date :{" "}
                  <span className="font-semibold text-slate-900">
                    {invoiceMeta.date}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <section ref={centerDetailsRef} className="max-w-[360px]">
                <div className="rounded-2xl px-5 py-4 shadow-sm">
                  <h2 className="mb-4 pb-2 text-base font-semibold text-slate-900">
                    Center Details
                  </h2>

                  <div className="space-y-2 text-sm text-slate-700">
                    {centerDetails.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-4 leading-6"
                      >
                        <span className="w-28 shrink-0 text-slate-400">
                          {item.label}
                        </span>
                        <span className="font-medium text-slate-800">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section ref={billingSummaryRef} className="flex justify-center">
                <div className="w-full max-w-[620px] rounded-[28px] border border-slate-200 bg-white px-6 py-7 shadow-[0_14px_36px_rgba(15,23,42,0.14)] sm:px-8">
                  <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900">
                    Billing Summary
                  </h2>

                  <div className="mb-6">
                    <p className="mb-3 text-sm font-semibold text-slate-900">
                      Package Details
                    </p>
                    {billingLines.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start justify-between gap-6 text-sm text-slate-500"
                      >
                        <span className="max-w-[72%] leading-6">
                          {item.label}
                        </span>
                        <span className="shrink-0 font-semibold text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <p className="mb-3 text-sm font-semibold text-slate-900">
                      Detailed Bill Breakdown
                    </p>
                    <div className="space-y-2">
                      {breakdownLines.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-6 text-sm text-slate-500"
                        >
                          <span>{item.label}</span>
                          <span className="font-medium text-slate-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-900">
                        Total Amount Payable
                      </span>
                      <span className="text-2xl font-bold text-[#7C3AED]">
                        ₹29,382.00
                      </span>
                    </div>
                    <p className="mt-1 text-right text-xs text-slate-400">
                      (Include all payable taxes)
                    </p>
                  </div>
                </div>
              </section>

              <div className="print:hidden flex justify-center pt-2">
                <Button
                  size="addbutton"
                  variant="default"
                  type="button"
                  onClick={handleDownload}
                >
                  <Download />
                  Download Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecondaryLayout>
  );
};

export default InvoiceTemplate;
