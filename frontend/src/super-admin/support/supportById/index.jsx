import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Headset } from "lucide-react";
import React from "react";
import MessageBox from "./components/MessageBox";
import { useLocation, useNavigate } from "react-router-dom";
import TicketList from "./components/TicketList";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";

const SupportById = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // console.log("state",state);

  return (
    <ContentLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Headset size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Support Center
            </h1>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Manage support tickets and help center resources
            </p>
            <CustomeBreadcrumb
              goBack={() => navigate("/support")}
              buttonName="Support Center list"
              currentPageName="Ticket Details"
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-stretch gap-10 px-4 xl:h-[80vh]">
          <div className="w-full xl:w-[50%] h-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4">
            <TicketList data={state} />
          </div>
          <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-lg w-full xl:w-[50%]">
            <MessageBox details={state} />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default SupportById;
