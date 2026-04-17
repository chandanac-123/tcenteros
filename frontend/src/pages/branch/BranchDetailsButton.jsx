import React, { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import AddBranchDetails from './dashboard-branch/AddBranchDetails'

const BranchDetailsButton = ({ isLimitReached }) => {
  const [openAddBranch, setOpenAddbranch] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleOpenBranch = () => {
    if (isLimitReached) {
      setShowError(true)
      return
    }

    setShowError(false)
    setOpenAddbranch(true)
  }

  return (
    <div className='flex flex-col'>
      <div className='flex justify-end'>
        <Button size='addbutton' onClick={handleOpenBranch}>
          + Create Branch
        </Button>
      </div>

      {showError && (
        <p className='text-red_text mb-2'>
          No branches purchased. Please purchase a branch.
        </p>
      )}
      <AddBranchDetails open={openAddBranch} onOpenChange={setOpenAddbranch} />
    </div>
  )
}
export default BranchDetailsButton
