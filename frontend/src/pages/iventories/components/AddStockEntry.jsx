import React from 'react'
import CustomeModal from "@common/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";

const AddStockEntry = ({ openStockEntry, setOpenStockEntry }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenStockEntry(false);
    };

    return (
        <CustomeModal open={openStockEntry} onOpenChange={setOpenStockEntry}>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl space-y-5 "
            >
                {/* Header */}
                <h2 className="text-xl font-semibold bg-[#F0DEFF] rounded-lg px-4 py-3">
                  Stock Entry
                </h2>

                {/* Product Name */}
                <Input
                    label="Supplier Name"
                    placeholder="Enter Supplier Name"
                />

                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Invoice Name"
                        placeholder="Add"
                    />

                    <Input
                        label="Invoice Date"
                        placeholder="Add"
                    />

                    <Input
                        label="product Name"
                        placeholder="Add"
                    />

                    <Input
                        label="Quantity"
                        placeholder="Add"
                    />

                    <Input
                        label="Purchase Cost"
                        placeholder="Add"
                    />

                    <Input
                        label="Total Cost"
                        placeholder="Add"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">


                    <Button size="addbutton" type="submit">
                        Add Stock
                    </Button>
                </div>
            </form>
        </CustomeModal>
    );
}

export default AddStockEntry
