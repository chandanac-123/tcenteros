import React from 'react'
import CustomeModal from '@common/CustomeModal'


const AmountForm = ({ open, setOpen }) => {
    return (
        <CustomeModal
            open={open}
            onOpenChange={setOpen}
            header="Please set your Network amount per day for a user  "
        >
            <form>
                
            </form>
        </CustomeModal>

        
    )
}

export default AmountForm
