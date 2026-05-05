import { useOnboardingCenters } from '@api-queries/center-admin/on-boarding/Query';
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import Header from '@pages/onboarding-pages/components/Header'
import React from 'react'
import { Mail, Phone, MapPin, Users } from 'lucide-react';

const CentersList = () => {
  const { data, isLoading, isError, error } = useOnboardingCenters();
  console.log("Data ", data);

  if (isLoading) return <p>Loading centers...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  return (
    <SecondaryLayout>
      <Header />
      <div className="px-4 sm:px-6 md:px-10 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data?.data?.map((center) => (
            <div
              key={center.id}
              className="relative rounded-2xl p-[1px] bg-gradient-to-br from-indigo-400/40 via-transparent to-purple-400/40 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
            >
              {/* INNER CARD */}
              <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">

                {/* TOP GRADIENT LINE */}
                <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />

                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                      {center.center_name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {center.center_id}
                    </span>
                  </div>

                  {/* STATUS BADGE */}
                  {/* <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                    Active
                  </span> */}
                </div>

                {/* CONTACT */}
                <div className="flex flex-col gap-2 text-sm text-gray-600">

                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" />
                    <span className="truncate">{center.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-purple-500" />
                    {center.phone}
                  </div>

                  <div className="flex items-center gap-2 capitalize">
                    <MapPin size={16} className="text-indigo-500" />
                    {center.city}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-500" />
                    {center.members_count}+ Members
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
  )
}

export default CentersList
