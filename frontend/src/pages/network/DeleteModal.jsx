import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { useDeleteNetworkBookingMutation } from '@api-queries/center-admin/network/Query';

const DeleteModal = ({ open, setOpen, data }) => {

    const { mutateAsync: deleteBooking, isPending } = useDeleteNetworkBookingMutation();

    const handleDelete = async () => {
        try {
            await deleteBooking(data.network_membership_id);
            setOpen(false);
        } catch (error) {
        }
    };

    return (
        <>
            <CustomeModal
                open={open}
                onOpenChange={setOpen}
                header={''}
            >
                <form className='space-y-5' >
                    <h2 className='text-[20px] leading-[30px]'>Do you sure you want to Delete this request?</h2>
                    <p>Deleting this request will remove <span className='font-semibold'>{data?.member_full_name}</span> permanemtly from the request list. </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            size='addbutton'
                            variant='outline_secondary'
                            type='button'

                        >
                            Cancel
                        </Button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="border border-input border-red-700 rounded-md px-5 text-red-700  font-medium justify-between"
                        >
                            Delete
                        </button>
                    </div>
                </form>

            </CustomeModal>
        </>
    )
}

export default DeleteModal
