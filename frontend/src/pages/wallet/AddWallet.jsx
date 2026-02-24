import React, { useState } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useCreateWalletAmountMutation } from "@api-queries/wallet/Query"
import { toast } from 'sonner'

const AddWallet = ({ open, setOpen }) => {
    const [amount, setAmount] = useState('')
    const { mutate: createWalletAmount, isPending } = useCreateWalletAmountMutation();

    const handleAddWalletAmount = (e) => { 
        e.preventDefault()
        if (!amount || Number(amount) <= 0) return
        createWalletAmount(
            { deposit: Number(amount) },
            {
                onSuccess: () => {
                    setAmount('')
                    setOpen(false)
                    toast.success("You successfully added your wallet amount")
                },
                onError: (error) => {
                    const message =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Failed to add wallet amount"
                    toast.error(message)
                }
            }
        )
    }

    return (
        <CustomeModal open={open} onOpenChange={setOpen} >
            <form className="space-y-4" onSubmit={handleAddWalletAmount}>
                <h2 className="min-w-[300px] text-[20px] leading-[30px] bg-[#F0DEFF] rounded-lg p-3">
                    Add Wallet
                </h2>
                <Input
                    label="Amount"
                    placeholder="Enter Your Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <div className="flex justify-center gap-3">

                    <Button size="addbutton" type="submit" disabled={isPending}>
                        {isPending ? "Processing..." : "Add Wallet"}
                    </Button>
                </div>
            </form>
        </CustomeModal>
    )
}

export default AddWallet
