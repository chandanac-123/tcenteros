import React from 'react'
import ContentLayout from "@common/masterLayout/ContentLayout"
import { Button } from '@pages/components/ui/button'


const CenterDetails = () => {
    return (
        <ContentLayout>
            <div className="">
                <div className="">
                    <h2 className='not-italic font-medium leading-[140%] text-[24px] tracking-[-0.24px]'>Center Details</h2>


                    {/* ::::: Center Information :::::: */}

                    <div className=" px-5 py-1 space-y-2">
                        <h3 className="text-xl font-medium ">
                            Center Information
                        </h3>
                        <div className="flex flex-col justify-center p-5 space-y-5 rounded-[19px] border ">
                            <div className=" grid grid-cols-3 gap-6">

                                {/* 1 → start */}
                                <div className="flex flex-col justify-self-start text-left">
                                    <span className='text-pricing_text text-sm'>Center Name</span>
                                    <span className='text-sm font-normal leading-[137%]'>Fitrex</span>
                                </div>

                                {/* 2 → center */}
                                <div className="flex flex-col justify-self-center text-left ">
                                    <span className='text-pricing_text text-sm'>Center Caterogy</span>
                                    <span className=' text-sm font-normal leading-[137%]'>Dance Studio</span>
                                </div>

                                {/* 3 → end */}
                                <div className="flex flex-col justify-self-end text-left ">
                                    <span className='text-pricing_text text-sm'>Center Code</span>
                                    <span className='text-sm font-normal leading-[137%]'>213wdr233</span>
                                </div>

                                {/* next row */}
                                <div className="flex flex-col justify-self-start text-left">
                                    <span className='text-pricing_text text-sm'>Email address </span>
                                    <span className='text-sm font-normal leading-[137%]'>teamfit@test.com</span>
                                </div>

                                <div className="flex flex-col justify-self-center text-left">
                                    <span className='text-pricing_text text-sm'>Phone</span>
                                    <span className='text-sm font-normal leading-[137%]'>+91 9876543210</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className='text-pricing_text text-sm'>Center Description</span>
                                <p className='text-sm font-normal leading-[137%]'>
                                    A fitness center dedicated to improving health through guided workouts, expert trainers, and structured programs.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* ::::: Address :::::: */}

                    <div className=" px-5 py-2 space-y-2">
                        <h3 className="text-xl font-medium ">
                            Address
                        </h3>
                        <div className="w-full flex flex-col  justify-center p-5 gap-6 rounded-[19px] border">
                            <div className="w-full  flex   gap-6 justify-between">
                                <div className="w-[40%] flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className='text-pricing_text text-sm'>Country</span>
                                        <span className='text-sm font-normal leading-[137%]'>India</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className='text-pricing_text text-sm'>State</span>
                                        <span className='text-sm font-normal leading-[137%]'>Kerala</span>
                                    </div>
                                </div>
                                <div className="w-[40%] flex justify-between items-center ">
                                    <div className="flex flex-col">
                                        <span className='text-pricing_text text-sm'>City</span>
                                        <span className='text-sm font-normal leading-[137%]'>Kochi</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className='text-pricing_text text-sm'>Pincode</span>
                                        <span className='text-sm font-normal leading-[137%]'>614547</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex   gap-6 justify-between">
                                <div className="w-[40%]">
                                    <div className="flex flex-col">
                                        <span className='text-pricing_text text-sm'>Address 1</span>
                                        <span className='text-sm font-normal leading-[137%]'>2nd Floor, Greenfield Plaza,MG Road, Indiranagar,</span>
                                    </div>
                                </div>
                                <div className="w-[40%]  ">
                                    <div className="flex flex-col">
                                        <span className='text-pricing_text text-sm'>Address 2</span>
                                        <span className='text-sm font-normal leading-[137%]'>2nd Floor, Greenfield Plaza,MG Road, Indiranagar,</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/*  ::::::: Member Details ::::::: */}

                    <div className="px-5 py-1 space-y-2">
                        <h3 className="text-xl font-medium ">
                            Member Details
                        </h3>
                        <div className="flex justify-between items-center p-5 border  rounded-[19px]">
                            <div className="flex flex-col">
                                <span className='text-pricing_text text-sm'>Member Name</span>
                                <span className='text-sm font-normal leading-[137%]'>Arjun</span>
                            </div>

                            <div className="flex flex-col">
                                <span className='text-pricing_text text-sm'>Time Slot</span>
                                <span className='text-sm font-normal leading-[137%]'>5:00 AM - 6:00 AM</span>
                            </div>

                            <div className="flex flex-col">
                                <span className='text-pricing_text text-sm'>Started Date</span>
                                <span className='text-sm font-normal leading-[137%]'>08 - 08 - 2025</span>
                            </div>

                            <div className="flex flex-col">
                                <span className='text-pricing_text text-sm'>Ended Date</span>
                                <span className='text-sm font-normal leading-[137%]'>12 - 08 - 2025</span>
                            </div>

                            <div className="">
                                <Button
                                    size='addbutton'
                                    type='submit'
                                >
                                    Request Number
                                </Button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </ContentLayout>
    )
}

export default CenterDetails
