import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'

const DeleteWallet = ({ open, setOpen, data }) => {
    return (
        <>
            <CustomeModal
                open={open}
                onOpenChange={setOpen}
                header={''}
            >
                <form className='space-y-6' >
                    <h2 className='text-[20px] leading-[30px] px-2'>Do you sure you want to delete this transaction history?</h2>
                    <p className='px-4'>Deleting this transaction will remove permanemtly from the transaction history. </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            size='addbutton'
                            variant='outline_secondary'
                            type='button'

                        >
                            Cancel
                        </Button>
                        <button
                            
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

export default DeleteWallet
