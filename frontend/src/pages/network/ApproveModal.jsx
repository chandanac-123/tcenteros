import React from 'react'
import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'



const ApproveModal = ({ open, setOpen,data }) => {
    return (
        <>
            <CustomeModal
                open={open}
                onOpenChange={setOpen}
                header={''}
            >
                <form className='space-y-5 '>
                    <h2 className='text-[20px] leading-[30px]'>Do you sure you want to Approve this request?</h2>
                    <p>Accepting this request will grant <span className='font-semibold'> {data.full_name}</span> temporary access to work out at this center. </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            size='addbutton'
                            variant='outline_secondary'
                            type='button'

                        >
                            Cancel
                        </Button>
                        <Button
                            size='addbutton'
                            type='submit'
                        >
                            Approve
                        </Button>
                    </div>
                </form>

            </CustomeModal>

        </>
    )
}

export default ApproveModal
