import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useEffect, useState } from 'react'
import {
  useCreateInventoryProfitMutation,
  useInventoryProfitValueQuery
} from '@api-queries/center-admin/inventory/Query'

const AddInventoryProfit = ({ open, setOpen }) => {
  const [inventoryProfit, setInventoryProfit] = useState('')
  const { data } = useInventoryProfitValueQuery()
  const { mutate: createInventoryProfit } = useCreateInventoryProfitMutation()
  
    useEffect(() => {
      if (data?.inventory_profit) {
        setInventoryProfit(data.inventory_profit)
      }
    }, [data])

  const handleInventoryProfit = async () => {
    try {
      await createInventoryProfit({ inventory_profit: Number(inventoryProfit) })
      setOpen(false)
      setInventoryProfit('')
    } catch (error) {}
  }

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Add Inventory Profit'
    >
      <Input
        label='Inventory Profit'
        name='inventory_profit'
        value={inventoryProfit}
        onChange={e => setInventoryProfit(e.target.value)}
      />

      {/* Buttons */}
      <div className='flex justify-end gap-3 pt-4'>
        <Button size='addbutton' type='submit' onClick={handleInventoryProfit}>
          Submit
        </Button>
      </div>
    </CustomeModal>
  )
}

export default AddInventoryProfit
