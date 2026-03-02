import React from 'react'
import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from "@pages/components/ui/input";


const FilterStockModal = ({ openFilter, setOpenFilter }) => {
    return (
        <CustomeModal open={openFilter} onOpenChange={setOpenFilter}>
            <div className="p-6 rounded-2xl min-w-[400px]">

                {/* TYPE */}
                <h3 className="text-md font-medium mb-3">Category</h3>
                <div className="flex gap-3 mb-6">
                    {["Supplement", "Accessories"].map((type) => (
                        <button
                            key={type}
                            className="px-5 py-2 rounded-xl font-medium bg-gray-100 text-gray-800"
                        >
                            {type}
                        </button>
                    ))}
                </div>

          
                {/* STATUS */}
                <h3 className="text-md font-medium mb-3">Transaction Type</h3>
                <div className="flex gap-3 flex-wrap mb-8">
                    {["In", "Out","Return","Adjustment"].map((status) => (
                        <button
                            key={status}
                            className="px-5 py-2 rounded-xl font-medium bg-gray-100 text-gray-800"
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Price Range */}

                <h3 className="text-md font-medium mb-3">Price Range</h3>
                <div className="flex gap-3 flex-wrap mb-8">
                    <Input
                        placeholder="Enter Product Name"
                    />
                </div>




                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline_secondary"
                        className="px-5"
                        onClick={() => setOpenFilter(false)}
                    >
                        Clear
                    </Button>

                    <Button
                        variant="outline_primary"
                        className="px-5"
                        onClick={() => setOpenFilter(false)}
                    >
                        Apply
                    </Button>
                </div>

            </div>
        </CustomeModal>
    )
}

export default FilterStockModal
