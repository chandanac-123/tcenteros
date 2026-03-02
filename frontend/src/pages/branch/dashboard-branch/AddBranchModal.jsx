import CustomeModal from '@common/CustomeModal'
import logo from '@assets/header-icons/logo_in_auth.svg'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react';
import { useAddBranchCountMutation } from '@api-queries/branch/Query';



const AddBranchModal = ({ open, onOpenChange }) => {
    const [count, setCount] = useState(1);
    const { mutateAsync: addCount, isPending } = useAddBranchCountMutation()


    const increment = () => {
        setCount(prev => prev + 1);
    };

    const decrement = () => {
        setCount(prev => (prev > 1 ? prev - 1 : 1));
    };

    return (
        <CustomeModal open={open} onOpenChange={onOpenChange}  >
            <div className="flex flex-col space-y-4 min-w-[380px]">

                <div className="">
                    <div className='flex justify-center'>
                        <img src={logo} alt='Logo' className='w-28 h-16' />
                    </div>
                </div>

                <h2 className='text-sm font-semibold'>Purchase Branches</h2>

                <div className="flex justify-between items-center">
                    <div className="flex flex-col space-y-2 py-3">
                        <p className='text-[14px] text-[#7C7C7C]'>Branch Price</p>
                        <div className="flex border text-[#8B24E2] px-4 py-1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] gap-3">
                            <p>Branch</p>
                            <p> ₹1000</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <p className='text-[14px] text-[#7C7C7C]'>
                            No. of Branches
                        </p>

                        <div className="flex justify-around gap-1 ">

                            <button onClick={decrement}
                                className="px-3 py-1 text-lg border rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold text-[#8B24E2] hover:bg-purple-50 transition"
                            >
                                −
                            </button>

                            <div className="px-4 py-1 flex items-center rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold min-w-[40px] text-center">
                                {count}
                            </div>

                            <button onClick={increment}
                                className="px-3 py-1 text-lg border rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold text-[#8B24E2]  hover:bg-purple-50 transition"
                            >
                                +
                            </button>

                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-3">
                    <h2 className='font-semibold'>Purchase Summary</h2>
                    <div className="flex justify-between items-center">
                        <p className='text-[14px] text-[#7C7C7C]'>Cost Per Branch: </p>
                        <p>₹1,000.00</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className='text-[14px] text-[#7C7C7C]'>Selected Branches: </p>
                        <p>₹3,000.00</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className='text-[14px] text-[#7C7C7C]'>GST </p>
                        <p>₹140.00</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className='text-[14px] text-[#7C7C7C]'>Tax</p>
                        <p>₹80.00</p>
                    </div>
                    <hr className="border-t-2 border-gray-300" />

                    <div className="flex justify-between items-center">
                        <p className='text-[14px] text-[#7C7C7C]'>Total Amount</p>
                        <p className='font-semibold'>₹3,220.00</p>
                    </div>
                    <div className="py-3">
                        <Button
                            variant='button_filled'
                            size='sm'
                            className='w-full'
                            type='submit'

                        >
                            Payment is Process
                        </Button>
                    </div>


                </div>




            </div>
        </CustomeModal>
    )
}

export default AddBranchModal