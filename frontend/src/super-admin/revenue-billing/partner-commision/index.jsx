import React from 'react'

const PartnerCommision = () => {
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          <CircleDollarSign size={30} className="text-onboard_primary" />
        </div>
        <div className="flex flex-col justify-center gap-3">
          <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
            Revenue & Billing
          </h1>
          <p className="text-[#393636] font-inter text-[14px] font-medium">
            Track SaaS revenue and partner commissions
          </p>
        </div>
      </div>
    </div>
  )
}

export default PartnerCommision
