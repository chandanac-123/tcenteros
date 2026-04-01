import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'

const AddInventoryProfit = ({ open, setOpen }) => {
  const [inventoryProfit, setInventoryProfit] = useState('')

  const handleInventoryProfit = async () => {
    try {
      await runPayroll({ payroll_cycle_day: Number(payrollCycleDay) })
      setPayrollCycleDay('')
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
