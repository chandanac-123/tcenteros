import { useOnboardingCenters } from "@api-queries/center-admin/on-boarding/Query";
import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import Header from "@pages/onboarding-pages/components/Header";
import React from "react";
import {  MapPin, Users } from "lucide-react";
import { Spinner } from "@pages/components/ui/spinner";

const CentersList = () => {
  const { data, isLoading, isError, error } = useOnboardingCenters();

  if (isLoading)
    return (
      <p className="flex justify-center items-center">
        <Spinner />
      </p>
    );
  if (isError) return <p>Error: {error.message}</p>;
  return (
    <SecondaryLayout>
      <Header />
      <div className="px-4 sm:px-6 md:px-10 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.data?.map((center) => (
            <div
              key={center.id}
              className="relative rounded-2xl p-[1px] bg-gradient-to-br from-[#1AA0FF]/40 via-transparent to-[#ff02d5]/40 hover:from-[#1AA0FF] hover:to-[#ff02d5] transition-all duration-300"
            >
              {/* INNER CARD */}
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                {/* TOP GRADIENT LINE */}
                {/* <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#1AA0FF] to-[#ff02d5]" /> */}

                {/* CONTACT */}
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <div className="flex justify-between gap-2">
                    <div>
                      <img src={center.logo_url} alt={center.center_name} className="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-800 capitalize">
                        {center.center_name}
                      </h3> <div className="flex items-center gap-2 capitalize">

                        <MapPin size={16} className="text-indigo-500" />
                        {center.city}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-purple-500" />
                        {center.members_count}+ Members
                      </div></div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {data?.data?.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            No centers found
          </div>
        )}
      </div>
    </SecondaryLayout>
  );
};

export default CentersList;
