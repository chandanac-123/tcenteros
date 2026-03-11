import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import dummy from '@assets/images/dummy.png'

const WhyWalletModal = ({ open, setOpen }) => {
  return (
    <div
      className="flex min-h-screen justify-center items-center px-2 overflow-hidden"
      style={{
        backgroundImage: `url(${dummy})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 9999
      }}
    >
      <CustomeModal open={open} onOpenChange={setOpen}>
        
        {/* Modal Container */}
        <div className="flex flex-col min-w-[500px] max-h-[80vh]">

          {/* 🔹 Header (STICKY) */}
          <div className="pb-4 h-[10%] border-b">
            <h2 className="text-[22px] font-semibold">
              Why you creating a wallet?
            </h2>
          </div>

          {/* 🔹 Scrollable Content */}
          <div className="h-[80%] overflow-y-auto py-4 pr-2 space-y-5 text-[14px] leading-[22px] text-gray-700">
            
            <div>
              <p className="font-semibold text-black">
                • Understanding Your Center Network Wallet
              </p>
              <p className="mt-2">
                To ensure seamless operation within our interconnected fitness network, every partner center is required to maintain an active Center Wallet. This wallet acts as the financial engine that powers real-time, cross-center access for your members.
              </p>
            </div>

            <div>
              <p className="font-semibold text-black">
                • How Network Settlements Work
              </p>
              <p className="mt-2">
                As part of the network, your members enjoy the flexibility of working out at other partner facilities. When one of your "Home Center" members visits another network location, instant payment is required to compensate for that session.
              </p>
              <p className="mt-2">
                Instead of complicated manual invoicing between centers, our system handles this automatically. The session fee is instantly deducted from your Center Wallet and transferred to the serving center.
              </p>
            </div>

            <div>
              <p className="font-semibold text-black">
                • Platform Fees & Requirements
              </p>
              <p className="mt-2">
                To sustain the secure infrastructure that makes instant roaming possible, a <span className="font-semibold">15%</span> Platform Fee is applied to these cross-center transactions, which is also deducted automatically from your wallet balance at the time of usage.
              </p>
            </div>

            <div>
              <p className="font-semibold text-black">
                • Simplicity and Sustainability
              </p>
              <p className="mt-2">
                To ensure your members never face a service interruption while visiting other partners, we require centers to maintain sufficient funds:
              </p>

              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  An initial <span className="font-semibold">₹20,000</span> Security Deposit to get started.
                </li>
                <li>
                  A Minimum Balance of <span className="font-semibold">₹10,000</span> to keep roaming active.
                </li>
              </ul>

              <p className="mt-2">
                By keeping your wallet funded, you ensure your members enjoy uninterrupted access to the entire network.
              </p>
            </div>
          </div>

          {/* 🔹 Footer Button (STICKY) */}
          <div className=" h-[10%] pt-4 border-t flex justify-end">
            <Button variant="button_filled" size="addbutton">
              Add Wallet
            </Button>
          </div>

        </div>
      </CustomeModal>
    </div>
  )
}

export default WhyWalletModal