import React, { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import AddBranchModal from './dashboard-branch/AddBranchModal'


const AddBranchButton = () => {
    const [openAddBranch, setOpenAddbranch] = useState(false)
    const handleOpenBranch = () => {
        setOpenAddbranch(true)
    }
    return (
        <div>
            <Button size='addbutton' onClick={handleOpenBranch}>
                + Add Branch
            </Button>
            <AddBranchModal open={openAddBranch} onOpenChange={setOpenAddbranch} />
        </div>
    )
}

export default AddBranchButton
