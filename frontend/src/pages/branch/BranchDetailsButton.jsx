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
    <div>
      {showError && (
        <p className='text-red-500 mb-2'>
          Branch limit reached. Please purchase more.
        </p>
      )}

      <Button size='addbutton' onClick={handleOpenBranch}>
        + Create Branch
      </Button>

      <AddBranchDetails open={openAddBranch} onOpenChange={setOpenAddbranch} />
    </div>
  )
}
export default BranchDetailsButton
