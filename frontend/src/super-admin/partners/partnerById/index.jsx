import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Building2, Handshake, IndianRupee, Users } from "lucide-react";
import React, { use, useState } from "react";
import PartnerDisplay from "../components/PartnerDisplay";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPartnerDetailsQuery } from "@api-queries/super-admin/partners/Query";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import AssignedCenterTable from "../components/AssignedCenterTable";

const PartnerById = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useGetPartnerDetailsQuery(id);

  const cardsData = [
    {
      label: "Total Commission Earned",
      value: data?.total_commission_earned || "0",
      icon: <Users />,
      type: "amount",
    },
    {
      label: "Total Active Centers",
      value: data?.total_centers,
      icon: <Building2 />,
    },
    {
      label: "Pending Payout",
      value: data?.pending_payouts,
      icon: <IndianRupee />,
      type: "amount",
    },
  ];
  return (
    <ContentLayout>
      <div>
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Handshake size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Partners Management
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Manage reseller partners and commissions
              </p>
              <CustomeBreadcrumb
                goBack={() => navigate("/partners")}
                buttonName="Partner Management list"
                currentPageName="Partner Details"
              />
            </div>
          </div>

          {/* <div className="pe-5">
                    <Button size="addbutton" onClick={() => setOpen(true)}>
                        <CircleArrowDown />
                        Export Report
                    </Button>
                </div> */}
        </div>

        <div className="px-5 flex flex-col gap-5">
          <PartnerDisplay data={data} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <HeaderCard cardsData={cardsData} />
          </div>
          <AssignedCenterTable data={data?.centers?.data} />
        </div>
      </div>
    </ContentLayout>
  );
};

export default PartnerById;
