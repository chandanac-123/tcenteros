import React, { useState } from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useCreateWalletAmountMutation } from '@api-queries/center-admin/wallet/Query'
import { showError, showSuccess } from '@utils/toast'
import { useCreatePaymentOrder, useVerifyPayment } from '@api-queries/common/razorPay/query'
import SuccessModal from '@pages/branch/message-popup/success'
import FaledModal from '@pages/branch/message-popup/failed'

const AddWallet = ({ open, setOpen, refetchWalletAmount, refetchWalletSummary, topUp }) => {
  const [amount, setAmount] = useState('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const { mutate: createWalletAmount, isPending } = useCreateWalletAmountMutation()
  const { mutate: create_Order, isPendings } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();



  const handleAddWalletAmount = e => {
    e.preventDefault()
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      showError('Amount must be greater than zero')
      return
    }
    //  Only when topUp is FALSE
    if (!topUp && numericAmount < 5000) {
      showError('Deposit amount must be exactly ₹5,000')
      return
    }
    createWalletAmount(
      { deposit: numericAmount },
      {
        onSuccess: (response) => {
          refetchWalletAmount()
          const payment_id = response?.payment_order_id;
          if (!payment_id) {
            showError("Payment ID not found .");
          }
          create_Order(payment_id, {
            onSuccess: (res) => {
              const orderData = res?.data;
              openRazorpay(orderData);
            },
            onError: (err) => {
              const message = err?.response?.data?.detail
              showError(message)
            },
          });

        },
        onError: error => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to add wallet amount'
          showError(message)
        }
      }
    )
  }

  const openRazorpay = async (orderData) => {
    setOpen(false);
    try {
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TcenterOS",
        description: "Branch purchase Payment",
        order_id: orderData.order_id,

        handler: async function (response) {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setOpen(false);
            if (!result || result.error) {
              showError("Payment Verification is Failed");
              setOpen(true);
              setOpenFailed(true);
            }
            await refetchWalletAmount();
            await refetchWalletSummary();
            setOpenSuccess(true)
            showSuccess("Wallet added successfully")
          } catch (err) {
            setOpen(true);
            setOpenFailed(true);
          }
        },

        // prefill: {
        //   name: "Customer Name",
        //   email: "customer@email.com",
        // },

        // theme: {
        //   color: "#6D28D9",
        // },
      };

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", function (response) {
        // onOpenChange(true);
        // setOpenFailed(true);
        showError(response.error.description || "Payment Failed");
      });
      razor.open();
    } catch (err) {
    }
  };

  return (
    <CustomeModal open={open} onOpenChange={setOpen}>
      <form className='space-y-2' onSubmit={handleAddWalletAmount}>
        <h2 className='min-w-[300px] text-[20px] leading-[30px] bg-[#F0DEFF] rounded-lg p-3'>
          Add Wallet
        </h2>
        <Input
          label='Amount'
          placeholder='Enter Your Amount'
          value={amount}
          onChange={e => setAmount(e.target.value)}

        />
        {topUp ? (
          <p className='text-xs text-secondary'>
            Wallet should have a minimum of 10,000
          </p>
        ) : (
          <p className='text-xs text-onboard_secondary'>
            Deposit amount should be 20,000
          </p>
        )}
        <div className='flex justify-center gap-3'>
          <Button
            variant='onboard_button_filled'
            size='addbutton'
            type='submit'
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Add Wallet'}
          </Button>
        </div>
      </form>
      <SuccessModal
        open={openSuccess}
        onOpenChange={setOpenSuccess}
      />
      <FaledModal open={openFailed} onOpenChange={setOpenFailed} />

    </CustomeModal>
  )
}

export default AddWallet
