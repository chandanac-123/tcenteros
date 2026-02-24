import React from 'react'
import ContentLayout from "@common/masterLayout/ContentLayout"
import { Button } from '@pages/components/ui/button'
import { useGetNetworkingBookingByIdQuery } from '@api-queries/network/Query'
import { useParams } from 'react-router-dom'


const CenterDetails = () => {
    const { id } = useParams();
    const { data, isPending } = useGetNetworkingBookingByIdQuery(id);

    return (
        <ContentLayout>
            <div className="">
                <div className="">
                    <h2 className='not-italic font-medium leading-[140%] text-[24px] tracking-[-0.24px]'>Center Details</h2>


                    {/* ::::: Center Information :::::: */}

                    <div className=" px-5 py-4 space-y-3">
                        <h3 className="text-xl font-medium ">
                            Center Information
                        </h3>
                        <div className="flex item  justify-between px-5 py-8 rounded-[19px] border ">


                            {/* 1 → start */}
                            <div className="flex flex-col  space-y-1">
                                <span className='text-pricing_text text-sm'>Center Name</span>
                                <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.center_name || "_ _"}</span>
                            </div>

                            {/* 2 → center */}
                            <div className="flex flex-col  space-y-1 ">
                                <span className='text-pricing_text text-sm'>Center Caterogy</span>
                                <span className=' text-sm font-normal leading-[137%]'>{data?.home_center.center_category || "_ _"}</span>
                            </div>

                            {/* next row */}
                            <div className="flex flex-col  space-y-1 ">
                                <span className='text-pricing_text text-sm'>Email address </span>
                                <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.center_email || "_ _"}</span>
                            </div>

                            <div className="flex flex-col space-y-1">
                                <span className='text-pricing_text text-sm'>Phone</span>
                                <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.center_number || "_ _"}</span>
                            </div>


                        </div>

                    </div>

                    {/* ::::: Address :::::: */}

                    <div className=" px-5 py-4 space-y-3">
                        <h3 className="text-xl font-medium ">
                            Address
                        </h3>
                        <div className="w-full flex flex-col  justify-center px-5 py-8 gap-6 rounded-[19px] border">
                            <div className="w-full  flex   gap-6 justify-between">
                                <div className="w-[40%] flex justify-between items-center">
                                    <div className="flex flex-col  space-y-1">
                                        <span className='text-pricing_text text-sm'>Country</span>
                                        <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.address?.country || "_ _"}</span>
                                    </div>

                                    <div className="flex flex-col  space-y-1">
                                        <span className='text-pricing_text text-sm'>State</span>
                                        <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.address?.state || "_ _"}</span>
                                    </div>
                                </div>
                                <div className="w-[40%] flex justify-between items-center ">
                                    <div className="flex flex-col  space-y-1">
                                        <span className='text-pricing_text text-sm'>City</span>
                                        <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.address?.city || "_ _"}</span>
                                    </div>

                                    <div className="flex flex-col  space-y-1">
                                        <span className='text-pricing_text text-sm'>Pincode</span>
                                        <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.address?.postal_code || "_ _"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex   gap-6 justify-between">
                                <div className="w-[40%]">
                                    <div className="flex flex-col  space-y-1">
                                        <span className='text-pricing_text text-sm'>Address 1</span>
                                        <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.address?.address_line_1 || "_ _"}</span>
                                    </div>
                                </div>
                                <div className="w-[40%]  ">
                                    <div className="flex flex-col  space-y-1">
                                        <span className='text-pricing_text text-sm'>Address 2</span>
                                        <span className='text-sm font-normal leading-[137%]'>{data?.home_center?.address?.address_line_2 || "_ _"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/*  ::::::: Member Details ::::::: */}

                    <div className="px-5 py-4 space-y-3">
                        <h3 className="text-xl font-medium ">
                            Member Details
                        </h3>
                        <div className="flex justify-between items-center p-5 border  rounded-[19px]">
                            <div className="flex flex-col space-y-1">
                                <span className='text-pricing_text text-sm'>Member Name</span>
                                <span className='text-sm font-normal leading-[137%]'>{data?.member?.full_name || "_ _"}</span>
                            </div>

                            <div className="flex flex-col space-y-1">
                                <span className='text-pricing_text text-sm'>Time Slot</span>
                                <span className='text-sm font-normal leading-[137%]'>
                                    {data?.member?.time_slot?.start_time || "_ _"}
                                    <span className='px-1'>-</span>
                                    {data?.member?.time_slot?.end_time || "_ _"}
                                </span>
                            </div>

                            <div className="flex flex-col space-y-1">
                                <span className='text-pricing_text text-sm'>Started Date</span>
                                <span className='text-sm font-normal leading-[137%]'>{data?.member?.start_date || "_ _"}</span>
                            </div>

                            <div className="flex flex-col space-y-1">
                                <span className='text-pricing_text text-sm'>Ended Date</span>
                                <span className='text-sm font-normal leading-[137%]'>{data?.member?.end_date || "_ _"}</span>
                            </div>

                            {/* <div className="">
                                <Button
                                    size='addbutton'
                                    type='submit'
                                >
                                    Request Number
                                </Button>
                            </div> */}
                        </div>
                    </div>


                </div>
            </div>
        </ContentLayout>
    )
}

export default CenterDetails
