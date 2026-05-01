import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Calendar, MapIcon } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import CalenderCard from "../components/CalenderCard";
import { Button } from "@pages/components/ui/button";
import { Badge } from "@pages/components/ui/badge";
import { useRenewalByIdQuery } from "@api-queries/super-admin/subcriptions/Query";

const RenewalDetailView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useRenewalByIdQuery(params?.id);
  console.log('data: ', data);

  return (
    <ContentLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Calendar size={30} className="text-onboard_primary" />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#3A3A3A] text-[18px] font-semibold">
              Renewal Calendar
            </p>

            <CustomeBreadcrumb
              goBack={() => navigate("/subscriptions/renewal-calender")}
              buttonName="Revenue Calendar"
              currentPageName="Revenue Details"
            />
          </div>
        </div>

        {/* Right */}
        <div className="w-full sm:w-auto">
          <CalenderCard day={data?.target_date?.split("-")[2]} renewals={data?.summary?.total_renewal_count} revenue={data?.summary?.total_renewal_revenue} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col mt-6 gap-4 w-full">
        <p className="font-medium text-base">{data?.summary?.total_renewal_count} Renewals</p>

        {/* Card */}
       {data?.renewals?.map((renewal) => (
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-4 rounded-lg w-full gap-4" key={renewal.id}>
          {/* Left Section */}
          <div className="flex items-start gap-3">
            <MapIcon className="text-gray-500 mt-1" />

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{renewal.center_name}</span>
                <Badge
                  className="bg-badge_bg_green border-none text-green_text rounded-xl w-auto"
                  variant="future_lead"
                  label={renewal.center_status}
                />
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span>{renewal.city},</span>
                <span>1200 + Members</span>
                <span className="flex text-textblack font-semibold gap-2">
                  Renew Date : <p className=""> {renewal?.renewal_date?.split("-")?.reverse()?.join("-")}</p>
                </span>
                <span className="flex gap-2">
                  Days Left : <p className="text-red_text">{renewal?.days_left_for_renewal} Days</p>
                </span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <span className="font-semibold text-base">₹{renewal?.renewal_amount}</span>

          
          </div>
        </div>))}

      </div>
    </ContentLayout>
  );
};

export default RenewalDetailView;
