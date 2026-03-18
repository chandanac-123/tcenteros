import React from 'react'
import failed from '@assets/payment/paymenFailedIcon.svg'
import CustomeModal from '@common/components/CustomeModal'



const FaledModal = ({ open, onOpenChange }) => {
    return (
        <CustomeModal open={open} onOpenChange={onOpenChange}  >
            <div className="flex flex-col items-center justify-center gap-2">
                <img src={failed} alt="view" />
                <h3 className='font-semibold'>Payment Failed</h3>
                <button
                    onClick={() => onOpenChange(false)}
                    className='border-[1px] text-[#6D758F] border-[#6D758F] w-full p-2 rounded-md'
                >
                    Please Retry Again
                </button>
            </div>
        </CustomeModal>
    )
}

export default FaledModal
