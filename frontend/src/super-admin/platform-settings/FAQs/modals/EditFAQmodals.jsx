import CustomeModal from '@common/components/CustomeModal'
import React from 'react'

const EditFAQmodals = ({ open, setOpen }) => {
    return (
        <CustomeModal open={open} onOpenChange={setOpen}>
            Test
        </CustomeModal>
    )
}

export default EditFAQmodals
