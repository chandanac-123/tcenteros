import React from 'react'
import CustomeModal from '@common/CustomeModal'
import success from '@assets/payment/paymentSuccessIcon.svg'
import { useNavigate } from 'react-router-dom'


const SuccessModal = ({ open, onOpenChange, count }) => {
    const navigate = useNavigate()
    return (
        <CustomeModal open={open} onOpenChange={onOpenChange}  >
            <div className="flex flex-col items-center justify-center gap-2">
                <img src={success} alt="view" />
                <h3 className='font-semibold'>Payment Successful</h3>
                <p>You have purchased {count} branch slots.</p>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className='border-[1px] text-[#6D758F] border-[#6D758F] w-full p-2 rounded-md '
                >
                    Back to Dashboard
                </button>
            </div>
        </CustomeModal>
    )
}

export default SuccessModal
