import React from 'react'
import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import InputFile from '@common/CustomeFileUpload'
import PasswordInput from '@common/PasswordInput'


const AddBranchDetails = ({ open, onOpenChange }) => {

    return (
        <CustomeModal open={open} onOpenChange={onOpenChange}  >
            <div className="flex flex-col  max-w-[80vw]">



                <h2 className='text-xl font-semibold pb-4'>Create Branch</h2>

                <form>
                    <div className="grid grid-col-1 sm:grid-cols-3 gap-4 p-3  space-y-1">


                        <Input
                            label='Branch Name'
                            name='branch_name'
                            placeholder='Enter Your Branch Name'
                        />
                        <CustomeSelect
                            label='Center Category'
                            name='center_id'
                            placeholder='Select Category'
                        />
                        <Input
                            label='Address Line 1'
                            name='branch_name'
                            placeholder='Address Line 1'
                        />
                        <Input
                            label='Address Line 2'
                            name='branch_name'
                            placeholder='Address Line 2'
                        />
                        <Input
                            label='Branch Email'
                            name='branch_name'
                            placeholder='Enter Your Email ID'
                        />
                        <PasswordInput
                            label="Create Password"
                            name="password"
                            placeholder="Create Password"
                            iconPosition="end"
                        />

                        <Input
                            label='*Phone number'
                            name='branch_name'
                            placeholder='*Phone number'
                        />


                        <div className="">
                            <InputFile
                                label='Profile Pic'
                                name='profile_photo'
                                placeholder='Upload Image'
                            />
                        </div>


                    </div>

                    <div className="grid grid-col-1 sm:grid-cols-4 gap-4 p-3  space-y-1">
                        <Input
                            label='Country'
                            name='branch_name'
                            placeholder='Country'
                        />
                        <Input
                            label='State'
                            name='branch_name'
                            placeholder='State'
                        />
                        <Input
                            label='City'
                            name='branch_name'
                            placeholder='City'
                        />


                        <Input
                            label='District'
                            name='branch_name'
                            placeholder='District'
                        />

                        <Input
                            label='Pincode'
                            name='branch_name'
                            placeholder='Pincode'
                        />


                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 space-y-1 pt-5">
                        <div className=""></div>
                        <div className="">
                            <Button
                                variant='button_filled'
                                size='sm'
                                className='w-full'
                                type='submit'
                            >
                                Create Branch
                            </Button>
                        </div>
                        <div className=""></div>
                    </div>


                </form>






            </div>
        </CustomeModal>
    )
}

export default AddBranchDetails
