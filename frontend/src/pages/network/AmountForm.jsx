import React, { useState } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useAddNetworkAmountMutation } from '@api-queries/network/Query'

const AmountForm = ({ open, setOpen }) => {
  const [amount, setAmount] = useState('')
  const { mutateAsync: addAmount, isPending } = useAddNetworkAmountMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount) return
    try {
      await addAmount((amount))
      setOpen(false)
      setAmount('')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CustomeModal open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-[20px] leading-[30px]">
          Please set your Network amount per day for a user
        </h2>

        <Input
          placeholder="250"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <Button
            size="addbutton"
            variant="outline_secondary"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button size="addbutton" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Submit"}
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AmountForm