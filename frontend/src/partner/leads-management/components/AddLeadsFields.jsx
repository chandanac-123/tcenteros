import { useGetBranchCategoriesListQuery } from '@api-queries/center-admin/branch/Query'
import { useCreateLead } from '@api-queries/partner/lead-managements/Query'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { leadValidationSchema } from '@utils/validations'
import { useFormik } from 'formik'
import { Building2, ChevronsLeft, Save } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddLeadsFields = () => {
    const navigate = useNavigate();
    const { mutate: createLead, isPending } = useCreateLead();
    const { data: categoryList, isLoading } = useGetBranchCategoriesListQuery();
    console.log("AllData", categoryList);

    const formik = useFormik({
        initialValues: {
            center_name: "",
            center_type: "",
            contact_person_name: "",
            phone_number: "",
            email: "",
            whatsapp_number: "",
            address_line_1: "",
            city: "",
            state: "",
            country: "",
            postal_code: "",
            source: "",
            remarks: "",
        },
        validationSchema: leadValidationSchema,
        onSubmit: (values) => {
            createLead(values, {
                onSuccess: () => {
                    navigate("/lead-management");
                },
                onError: (err) => {
                    console.error(err);
                }
            });
        }
    });

    const leadSource = [
        { id: 'meta_campaign', label: 'Meta Campaign' },
        { id: 'facebook_campaign', label: 'FaceBook Campaign' },
        { id: 'google_campaign', label: 'Google Campaign' },
        { id: 'manual_entry', label: 'Manual Entry' },
        { id: 'referral', label: 'Refferals' },
        { id: 'other', label: 'Others' }
    ]
    const centerTypeOptions =
        categoryList?.map((item) => ({
            id: item.id,        // value to send
            label: item.name,   // what user sees
        })) || [];
    return (
        <form onSubmit={formik.handleSubmit}>
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
                                className={"h-12"}
                                name="center_name"
                                value={formik.values.center_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter the Center Name"
                            />

                            {formik.touched.center_name && formik.errors.center_name && (
                                <p className="text-[#dd0e0e] text-xs">{formik.errors.center_name}</p>
                            )}
                        </div>

                        {/* Center Type */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Center Type
                            </label>
                            <CustomeSelect
                                name="center_type"
                                height={"h-12"}
                                placeholder="Select Center Type"
                                options={centerTypeOptions}
                                value={formik.values.center_type}
                                onChange={(value) => {
                                    formik.setFieldValue("center_type", value)
                                    formik.setFieldTouched("center_type", true)
                                }}
                            />

                            {formik.touched.center_type && formik.errors.center_type && (
                                <p className="text-[#dd0e0e] text-xs">{formik.errors.center_type}</p>
                            )}
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
                                className={"h-12"}
                                name="contact_person_name"
                                value={formik.values.contact_person_name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Contact Name"
                            />
                        </div>

                        {/* Center Type */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Phone Number <span className='text-red_text'>*</span>
                            </label>
                            <Input
                                className={"h-12"}
                                name="phone_number"
                                value={formik.values.phone_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Phone Number"
                            />
                            {formik.touched.phone_number && formik.errors.phone_number && (
                                <p className="text-[#dd0e0e] text-xs">{formik.errors.phone_number}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Email Address <span className='text-red_text'>*</span>
                            </label>
                            <Input
                                name="email"
                                className={"h-12"}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Email"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-[#dd0e0e] text-xs">{formik.errors.email}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Alternate Phone (Optional)
                            </label>
                            <Input
                                className={"h-12"}
                                name="whatsapp_number"
                                value={formik.values.whatsapp_number}
                                onChange={formik.handleChange}
                                placeholder="WhatsApp Number"
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
                                name="city"
                                value={formik.values.city}
                                onChange={formik.handleChange}
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
                                name="state"
                                value={formik.values.state}
                                onChange={formik.handleChange}
                                type="text"
                                placeholder="Enter State Name"
                                className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Country
                            </label>
                            <Input
                                name="country"
                                value={formik.values.country}
                                onChange={formik.handleChange}
                                placeholder="Enter District Name"
                                className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Pin code
                            </label>
                            <Input
                                name="postal_code"
                                value={formik.values.postal_code}
                                onChange={formik.handleChange}
                                placeholder="Enter Pincode"
                                className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Address
                            </label>
                            <Input
                                name="address_line_1"
                                value={formik.values.address_line_1}
                                onChange={formik.handleChange}
                                placeholder="Enter Adress"
                                className="w-full h-12 px-3 rounded-lg border border-[#DAD9D9] text-sm text-[#000000] placeholder:text-[#555555] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#000000]">
                                Source
                            </label>
                            <CustomeSelect
                                name="source"
                                height={'h-12'}
                                placeholder="Select The Lead Source"
                                options={leadSource}
                                value={formik.values.source}
                                onChange={(value) => formik.setFieldValue("source", value)}
                            />
                        </div>

                    </div>
                </div>

                <div className=" w-full flex items-center justify-end gap-5 py-4">
                    <Button
                        type="button"
                        size='addbutton'
                        variant="outline_primary"
                        onClick={() => navigate("/lead-management")}
                    >
                        <ChevronsLeft />
                        Cancel
                    </Button>

                    <Button size='addbutton' type="submit" disabled={isPending}>
                        <Save />
                        {isPending ? "Saving..." : "Save Lead"}
                    </Button>
                </div>


            </div>
        </form>
    )
}

export default AddLeadsFields

