import { useAllResellersQuery } from "@api-queries/center-admin/on-boarding/Query";
import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import Header from "@pages/onboarding-pages/components/Header";
import { Mail, Phone, MapPin, CreditCard, Landmark } from "lucide-react";

const ResellersList = () => {
  const { data: resellers } = useAllResellersQuery();
  console.log("resellers: ", resellers);

  return (
    <SecondaryLayout>
      <Header />

      <div className="px-4 sm:px-6 md:px-10 py-6">
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {resellers?.data?.map((reseller) => (
            <div
              key={reseller.id}
              className="bg-white rounded-2xl border border-grey-400 p-5 flex flex-col shadow-lg gap-4 hover:shadow-2xl transition-all duration-300"
            >
              {/* TOP */}
              <div className="flex items-center justify-between ">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {reseller?.full_name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {reseller?.reseller_id}
                  </span>
                </div>
              </div>

              {/* CONTACT */}
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {reseller.email}
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {reseller?.phone}
                </div>

                <div className="flex items-center gap-2 capitalize">
                  <MapPin size={16} />
                  {reseller?.city}
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
