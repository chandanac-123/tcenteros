import React, { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import AddBranchDetails from './dashboard-branch/AddBranchDetails'

const BranchDetailsButton = () => {
    const [openAddBranch, setOpenAddbranch] = useState(false)
    const handleOpenBranch = () => {
        setOpenAddbranch(true)
    }
    return (
        <div>
            <Button size='addbutton' onClick={handleOpenBranch}>
                + Create Branch
            </Button>
            <AddBranchDetails open={openAddBranch} onOpenChange={setOpenAddbranch} />
        </div>
    )
}

export default BranchDetailsButton
