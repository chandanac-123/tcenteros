import ContentLayout from "@common/MasterLayout/ContentLayout"
import { Button } from "@pages/components/ui/button"
import { CircleArrowDown, Handshake } from "lucide-react"
import PartnerCards from "./components/PartnerCards"
import PartnerTableList from "./components/partnerTableList"

const Partners = () => {
  return (
    <ContentLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Handshake size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Partners Management
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Manage reseller partners and commissions
              </p>
            </div>
          </div>

          <div className="pe-5">
            <Button size="addbutton" onClick={() => setOpen(true)}>
              <CircleArrowDown />
              Export Report
            </Button>
          </div>
        </div>
        <div className="px-4">
          <PartnerCards />
        </div>
        <div className="px-4 py-3 ">
          <PartnerTableList />
        </div>
      </div>

    </ContentLayout>
  )
}

export default Partners
