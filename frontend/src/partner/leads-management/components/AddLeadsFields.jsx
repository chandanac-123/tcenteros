import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { Building2, Save } from 'lucide-react'
import React from 'react'

const AddLeadsFields = () => {
    const leadSource = [
        { id: 'socialMedia', label: 'Social Media' },
        { id: 'direct', label: 'Direct' },
        { id: 'other', label: 'Others' }
    ]
    return (
        <div className='flex flex-col gap-5'>
            <div className="w-full bg-[#FFFFFF] rounded-xl shadow-[0px_2px_15px_rgba(0,0,0,0.15)] p-4 sm:p-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <Building2 size={20} className="text-[#1452D4]" />
                    </div>

                    <h2 className="text-base font-semibold text-[#000000]">
                        Center Information
                    </h2>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                    {/* Center Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Center Name
                        </label>
                        <Input
                            type="text"
                            placeholder="Eg: Fit Fury Fitness"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    {/* Center Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Center Type
                        </label>
                        <Input
                            type="text"
                            placeholder="Yoga center"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                </div>
            </div>

            <div className="w-full bg-[#FFFFFF] rounded-xl shadow-[0px_2px_15px_rgba(0,0,0,0.15)] p-4 sm:p-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <Building2 size={20} className="text-[#1452D4]" />
                    </div>

                    <h2 className="text-base font-semibold text-[#000000]">
                        Contact Information
                    </h2>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                    {/* Center Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Contact Person Name
                        </label>
                        <Input
                            placeholder="Eg : Pepe"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    {/* Center Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Phone Number <span className='text-red_text'>*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="924898258"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Email Address <span className='text-red_text'>*</span>
                        </label>
                        <Input
                            placeholder="Eg : pepeportugal3@gmail.com"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Alternate Phone (Optional)
                        </label>
                        <Input
                            placeholder="7373839292"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                </div>
            </div>

            <div className="w-full bg-[#FFFFFF] rounded-xl shadow-[0px_2px_15px_rgba(0,0,0,0.15)] p-4 sm:p-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <Building2 size={20} className="text-[#1452D4]" />
                    </div>

                    <h2 className="text-base font-semibold text-[#000000]">
                        Location & Lead Details
                    </h2>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                    {/* Center Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            City
                        </label>
                        <Input
                            placeholder="Enter City Name"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    {/* Center Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            State
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter State Name"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            District
                        </label>
                        <Input
                            placeholder="Enter District Name"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Pin code
                        </label>
                        <Input
                            placeholder="Enter Pincode"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Adress
                        </label>
                        <Input
                            placeholder="Enter Adress"
                            className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[#000000]">
                            Source
                        </label>
                        <CustomeSelect
                            placeholder='Select The Lead Source'
                            name='full_name'
                            height="h-12"
                            options={leadSource}
                        />

                    </div>

                </div>
            </div>

            <div className=" w-full flex items-center justify-end gap-5 py-4">
                <Button
                    size='addbutton'
                    variant="outline_secondary"
                >
                    Cancel
                </Button>

                <Button
                    className='flex items-center justify-center gap-2'
                    size='addbutton'
                >
                    <Save />
                    Save Lead
                </Button>
            </div>

        </div>
    )
}

export default AddLeadsFields

