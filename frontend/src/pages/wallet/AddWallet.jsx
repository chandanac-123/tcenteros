import React, { useState } from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useCreateWalletAmountMutation } from '@api-queries/wallet/Query'
import { showError, showSuccess } from '@utils/toast'

const AddWallet = ({ open, setOpen, refetchWalletAmount }) => {
  const [amount, setAmount] = useState('')
  const { mutate: createWalletAmount, isPending } =
    useCreateWalletAmountMutation()

  const handleAddWalletAmount = e => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    createWalletAmount(
      { deposit: Number(amount) },
      {
        onSuccess: () => {
          setAmount('')
          refetchWalletAmount()
          setOpen(false)
          showSuccess('You successfully added your wallet amount')
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
        <p className='text-xs text-onboard_secondary'>Add minimum 20,000</p>
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
    </CustomeModal>
  )
}

export default AddWallet
