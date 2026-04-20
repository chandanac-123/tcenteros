import React, { useState } from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import dummy from '@assets/images/dummy.png'
import { Switch } from '@pages/components/ui/switch'
import { ArrowBigRightDash } from 'lucide-react'
import WhyWalletModal from './WhyWalletModal'
import AddWallet from '@pages/wallet/AddWallet'
import {
  useNetworkToggleButtonMutation,
  useGetNetworkToggleButtonQuery
} from '@api-queries/center-admin/network/Query'
import { useNavigate } from 'react-router-dom'
import { useGetWalletAmountQuery } from '@api-queries/center-admin/wallet/Query'
import SuccessModal from '@pages/branch/message-popup/success'
import FaledModal from '@pages/branch/message-popup/failed'

const NetworkWalletModal = ({ open, setOpen }) => {
  const [openWhyModal, setOpenWhyModal] = useState(false)
  const [openAddWalletModal, setAddwalletModal] = useState(false)
  const navigate = useNavigate()
  const [openSuccess, setOpenSuccess] = useState(false)
  const [openFailed, setOpenFailed] = useState(false)
  const { data: networkToggle, isFetching: isNetworkToggleFetching } =
    useGetNetworkToggleButtonQuery()
  const { mutateAsync: enabled, isPending } = useNetworkToggleButtonMutation()
  const { data: walletAmout, refetch: refetchWalletAmount } =
    useGetWalletAmountQuery()
  const networkActive = networkToggle?.network_enabled ?? false

  const handleNext = () => {
    setOpenWhyModal(true)
  }

  const handleToggle = async checked => {
    try {
      await enabled(checked)
    } catch (error) {
      console.error(error)
    }
  }

  const handlePurchase = async () => {
    try {
      setOpenSuccess(true)
    } catch (error) {
      console.error('Purchase failed:', error)
      setOpenFailed(true)
    }
  }

  return (
    <>
      {/* NETWORK MODAL */}
      {open && !openWhyModal && (
        <div
          className='flex min-h-screen  justify-center items-center px-2 overflow-hidden'
          style={{
            backgroundImage: `url(${dummy})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 9999
          }}
        >
          <CustomeModal open={open} onOpenChange={setOpen}>
            <div className='min-w-[400px] space-y-5'>
              <div className='space-y-2'>
                <h2 className='text-black font-roboto text-[21px] font-medium leading-[140%]'>
                  Create Wallet
                </h2>
                <p className='text-black font-roboto text-[16px] font-medium leading-[140%]'>
                  The network is enabled add your wallet
                </p>
              </div>

              <div className='flex justify-between rounded-[10px] border border-[#DDD9D9] py-4 px-3'>
                <p className='text-[17px] font-medium'>Network Enable</p>
                <Switch
                  checked={networkActive}
                  onCheckedChange={handleToggle}
                  className='data-[state=checked]:bg-onboard_primary data-[state=unchecked]:bg-onboard_primary data-[state=checked]:border-onboard_primary'
                  disabled={isPending || isNetworkToggleFetching}
                />
              </div>

              <div className='flex justify-between rounded-[10px] border border-[#DDD9D9] p-3'>
                <p className='text-[17px] font-medium'>Create Wallet</p>
                <Button
                  onClick={() => setAddwalletModal(true)}
                  variant='onboard_button_filled'
                  size='addbutton'
                >
                  Add Wallet
                </Button>
                <AddWallet
                  open={openAddWalletModal}
                  setOpen={setAddwalletModal}
                  refetchWalletAmount={refetchWalletAmount}
                />
              </div>

              <div className='grid grid-cols-3 p-3'>
                <div />
                <div className='flex items-center justify-center'>
                  <button
                    onClick={handleNext}
                    className='text-[#0052FF] text-[14px]'
                  >
                    Why using the wallet ?
                  </button>
                </div>
                <div className='flex items-center justify-end'>
                  {/* <Button
                                        onClick={()=>navigate('/add-branches')}
                                        variant="onboard_outline_primary"
                                        size="addbutton"
                                    >
                                        Next
                                        <ArrowBigRightDash color='red' className="ml-2" />
                                    </Button> */}

                  <Button
                    variant='onboard_button_filled'
                    size='addbutton'
                    className='w-full'
                    onClick={handlePurchase}
                    disabled={isPending}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          </CustomeModal>
        </div>
      )}

      {/* WHY WALLET MODAL (must be outside) */}
      <WhyWalletModal open={openWhyModal} setOpen={setOpenWhyModal} />
      <SuccessModal open={openSuccess} onOpenChange={setOpenSuccess} />
      <FaledModal open={openFailed} onOpenChange={setOpenFailed} />
    </>
  )
}

export default NetworkWalletModal
