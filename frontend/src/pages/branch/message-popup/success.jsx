import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import success from '@assets/payment/paymentSuccessIcon.svg'
import { useNavigate } from 'react-router-dom'


const SuccessModal = ({ open, onOpenChange, count }) => {
    const navigate = useNavigate()
    return (
        <CustomeModal open={open} onOpenChange={onOpenChange}  >
            <div className="flex flex-col items-center justify-center gap-2">
                <img src={success} alt="view" loading="lazy"/>
                <h3 className='font-semibold'>Payment Successful</h3>
            </div>
        </CustomeModal>
    )
}

export default SuccessModal
