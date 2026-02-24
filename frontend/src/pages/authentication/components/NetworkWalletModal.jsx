import React, { useState } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import dummy from '@assets/images/dummy.png'
import { Switch } from '@pages/components/ui/switch'
import { ArrowBigRightDash } from 'lucide-react'
import WhyWalletModal from './WhyWalletModal'
import AddWallet from '@pages/wallet/AddWallet'

const NetworkWalletModal = ({ open, setOpen }) => {
    const [openWhyModal, setOpenWhyModal] = useState(false)
    const [openAddWalletModal,setAddwalletModal]=useState(false)

    const handleNext = () => {
        setOpenWhyModal(true)   // open why modal
    }

    return (
        <>
            {/* NETWORK MODAL */}
            {open && !openWhyModal && (
                <div
                    className='flex min-h-screen flex justify-center items-center px-2 overflow-hidden'
                    style={{
                        backgroundImage: `url(${dummy})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 9999
                    }}
                >
                    <CustomeModal open={open} onOpenChange={setOpen}>
                        <div className="min-w-[400px] space-y-5">

                            <div className="space-y-2">
                                <h2 className='text-black font-roboto text-[21px] font-medium leading-[140%]'>
                                    Create Wallet
                                </h2>
                                <p className='text-black font-roboto text-[16px] font-medium leading-[140%]'>
                                    The network is enabled add your wallet
                                </p>
                            </div>

                            <div className="flex justify-between rounded-[10px] border border-[#DDD9D9] py-4 px-3">
                                <p className='text-[17px] font-medium'>Network Enable</p>
                                <Switch />
                            </div>

                            <div className="flex justify-between rounded-[10px] border border-[#DDD9D9] p-3">
                                <p className='text-[17px] font-medium'>Create Wallet</p>
                                <Button 
                                onClick={()=>setAddwalletModal(true)}
                                variant="button_filled" size="addbutton">
                                    Add Wallet
                                </Button>
                                <AddWallet open={openAddWalletModal} setOpen={setAddwalletModal} />

                            </div>

                            <div className="grid grid-cols-3 p-3">
                                <div />
                                <div className="flex items-center justify-center">
                                    <button onClick={handleNext} className='text-[#0052FF] text-[14px]'>
                                        Why using the wallet ?
                                    </button>
                                </div>
                                <div className="flex items-center justify-end">
                                    <Button

                                        variant="outline_primary"
                                        size="addbutton"
                                    >
                                        Next
                                        <ArrowBigRightDash className="ml-2" />
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </CustomeModal>
                </div>
            )}

            {/* WHY WALLET MODAL (must be outside) */}
            <WhyWalletModal
                open={openWhyModal}
                setOpen={setOpenWhyModal}
            />
        </>
    )
}

export default NetworkWalletModal