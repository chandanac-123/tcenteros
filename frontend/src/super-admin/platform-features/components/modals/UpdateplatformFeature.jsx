import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { Textarea } from '@pages/components/ui/textarea'
import React from 'react'

const UpdateplatformFeature = ({open,setOpen}) => {
    return (
        <div>
            <CustomeModal className='min-w-[650px]' open={open} onOpenChange={setOpen}>
                <div className="bg-[#F0DEFF] rounded-md px-5 py-3">

                    <h2 className="text-black font-roboto text-[21px] font-medium leading-[140%]">Update Platform Features </h2>
                </div>
                <div className="flex flex-col gap-5 py-3">
                    <Input
                        label='Feature Name'
                        placeholder="Enter the Feature Name"
                    />

                    <Textarea
                        label='Feature Description '
                        placeholder="Add the Feature Description"
                    />

                    <Input
                        label='Set Feature Price'
                        placeholder="Enter the Feature Price"
                    />
                </div>


                <div className="flex items-center justify-end py-3">
                    <div className="flex items-center gap-4">
                        <Button variant="outline_secondary" size="addbutton" >
                            Cancel
                        </Button>
                        <Button size="addbutton" >
                            Create Feature
                        </Button>
                    </div>
                </div>
            </CustomeModal>
        </div>
    )
}

export default UpdateplatformFeature
