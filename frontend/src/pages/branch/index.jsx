import React, { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import AddBranchModal from './dashboard-branch/AddBranchModal'
import { useDashboardPermissions } from '@hooks/permissions/DashboardPermission'

const AddBranchButton = () => {
      const { hydrated, canAddBranch } = useDashboardPermissions()
      if (!hydrated) return null
    const [openAddBranch, setOpenAddbranch] = useState(false)
    const handleOpenBranch = () => {
        setOpenAddbranch(true)
    }
    return (
        <div>
            <Button disabled={!canAddBranch} size='addbutton' onClick={handleOpenBranch}>
                + Add Branch
            </Button>
            <AddBranchModal open={openAddBranch} onOpenChange={setOpenAddbranch} />
        </div>
    )
}

export default AddBranchButton
