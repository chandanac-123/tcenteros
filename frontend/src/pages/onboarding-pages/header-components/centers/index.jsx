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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-10">
        {data?.data?.map((center) => (
          <div
            key={center.id}
            className="relative p-5 rounded-2xl shadow-xl border bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white hover:scale-105 transition duration-300"
          >
            {/* Header */}
            <h3 className="font-semibold text-xl capitalize mb-3">
              {center.center_name}
            </h3>

            {/* Contact Person */}
            <p className="text-sm text-indigo-100 mb-3">
              {center.contact_person}
            </p>

            {/* Info Section */}
            <div className="flex flex-col gap-2 text-sm">

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="truncate">{center.email}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{center.phone}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{center.city}</span>
              </div>

              {/* Members */}
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{center.members_count}+ Members</span>
              </div>
            </div>

            {/* Footer Badge */}
            {/* <div className="absolute top-3 right-3 bg-white/20 text-xs px-2 py-1 rounded-full backdrop-blur">
              Active
            </div> */}
          </div>
        ))}
      </div>
    </SecondaryLayout>
  )
}

export default CentersList
