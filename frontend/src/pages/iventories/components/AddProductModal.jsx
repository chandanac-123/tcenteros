import React from "react";
import CustomeModal from "@common/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";

const AddProductModal = ({ open, setOpen }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <CustomeModal open={open} onOpenChange={setOpen}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl space-y-5 "
      >
        {/* Header */}
        <h2 className="text-xl font-semibold bg-[#F0DEFF] rounded-lg px-4 py-3">
          Add Product
        </h2>

        {/* Product Name */}
        <Input
          label="Product Name"
          placeholder="Enter Product Name"
        />

        {/* Grid Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Category"
            placeholder="Enter Category"
          />

          <Input
            label="SKU"
            placeholder="Enter SKU"
          />

          <Input
            label="Unit Type"
            placeholder="e.g. Piece, Kg"
          />

          <Input
            label="Cost Price"
            placeholder="₹1500"
          />

          <Input
            label="Selling Price"
            placeholder="₹2000"
          />

          <Input
            label="Tax Category"
            placeholder="Enter Tax Category"
          />

          <Input
            label="Reorder Level"
            placeholder="Enter Reorder Level"
          />

          <Input
            label="Expire Date"
            placeholder="Select Expire Date"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
    

          <Button size="addbutton" type="submit">
            Add Product
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default AddProductModal;