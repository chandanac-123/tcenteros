import { useAllResellersQuery } from "@api-queries/center-admin/on-boarding/Query";
import CustomAvatar from "@common/components/getAvatarColor";
import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import { Spinner } from "@pages/components/ui/spinner";
import Header from "@pages/onboarding-pages/components/Header";
import { Mail, Phone, MapPin } from "lucide-react";

const ResellersList = () => {
  const { data: resellers, isLoading } = useAllResellersQuery();
  if (isLoading)
    return (
      <p className="flex justify-center items-center">
        <Spinner />
      </p>
    );
  return (
    <SecondaryLayout>
      <Header />

      <div className="px-4 sm:px-6 md:px-10 py-6">
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {resellers?.data?.map((reseller) => (
            <div
              key={reseller.id}
              className="relative rounded-2xl p-[1px] bg-gradient-to-br from-[#1AA0FF]/40 via-transparent to-[#ff02d5]/40 hover:from-[#1AA0FF] hover:to-[#ff02d5] transition-all duration-300"
            >
              {/* INNER CARD */}
              <div className="bg-white rounded-2xl p-3 flex flex-col gap-4 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">

                <div className="flex gap-3">
                  <div>
                    <CustomAvatar
                      src={null}
                      name={reseller.full_name}
                      size="w-16 h-16"
                    />
                  </div>
                  <div className="flex flex-col text-sm text-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                      {reseller?.full_name}
                    </h3>

                    <div className="flex items-center gap-1 capitalize">
                      <MapPin size={16} className="text-[#1AA0FF]" />
                      {reseller?.city}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {resellers?.total === 0 && (
          <div className="text-center text-gray-400 mt-10">
            No resellers found
          </div>
        )}
      </div>
    </SecondaryLayout>
  );
};

export default ResellersList;
