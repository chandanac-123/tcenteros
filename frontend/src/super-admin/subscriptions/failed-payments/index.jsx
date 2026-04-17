import DeleteModal from "@common/components/CustomeDelete";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import { BanknoteX, TriangleAlert } from "lucide-react";
import { useState } from "react";

const FailedPayments = () => {
  const [suspendOpen, setSuspendOpen] = useState(false);
  return (
    <ContentLayout>
      <div className="flex items-center justify-between p-4">
        <div className="flex  gap-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <TriangleAlert
              size={16}
              strokeWidth={2.75}
              className="text-danger"
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Expiring Soon
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              14 centres require renewal attention
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col border rounded-xl py-2 px-6 justify-center items-center gap-2">
            <div className="flex gap-2">
              <TriangleAlert
                size={16}
                strokeWidth={2.75}
                className="text-danger"
              />
              <span className="flex text-xs text-textgrey">Failed Payment</span>
            </div>
            <span className="flex font-semibold">125 Centers</span>
          </div>
          <div className="flex flex-col border rounded-xl py-2 px-6 justify-center items-center gap-2">
            <div className="flex gap-2">
              <BanknoteX size={16} strokeWidth={2.75} className="text-danger" />
              <span className="flex text-xs text-textgrey">
                Total Failed Amount
              </span>
            </div>

            <span className="flex font-semibold">1.25 CR</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl border shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-yellow-400 text-xl font-bold">Y</span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="font-semibold text-textgrey">
              Yoga Hub Bangalore
            </span>

            <span className="text-sm text-textgrey">
              Bangalore , 1200 + Members
            </span>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col gap-1 text-sm text-textgrey flex-wrap">
          <span>
            Expired Date :{" "}
            <span className="font-medium text-textblack">13 - 04 - 2026</span>
          </span>

          <span>
            Due by : <span className="font-medium text-gray-800">13 Days</span>
          </span>
        </div>

        <div className="flex flex-col gap-1 text-sm text-textgrey flex-wrap">
          <span>
            Amount : <span className="font-medium text-textblack">13,443</span>
          </span>

          <span>
            Failure Reason :{" "}
            <span className="font-medium text-danger">Insufficient Funds</span>
          </span>
        </div>

        {/* Right Section */}
        <div className="flex justify-end sm:justify-center">
          <Button
            variant="danger"
            size="addbutton"
            className="w-full sm:w-auto"
            onClick={() => setSuspendOpen(true)}
          >
            Suspend Center
          </Button>
        </div>
      </div>
      <DeleteModal
        open={suspendOpen}
        setOpen={setSuspendOpen}
        suspend={true}
        header="Are you sure you want to suspend this subscription?"
        description="This Subscription will be removed from your listing the center will lost the full access as per the subscription This action cannot be undone.?"
      />
    </ContentLayout>
  );
};

export default FailedPayments;
