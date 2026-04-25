import { useCreateBranchPriceMutation } from "@api-queries/super-admin/branching/Query";
import { useAppPermissions } from "@hooks/index";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import { Plus } from "lucide-react";
import React, { useState } from "react";

const AddBranchPrice = () => {
  const [branchPrice, setBranchPrice] = useState();
  const { mutateAsync: createBranchPrice } = useCreateBranchPriceMutation();
  const { hydrated, canBranchingAdd } = useAppPermissions();
  const hasBranchPrice = Boolean(String(branchPrice ?? "").trim());
  if (!hydrated) return null;

  const handleCreateBranchPrice = async () => {
    try {
      await createBranchPrice({ price: branchPrice });
    } catch (error) {
      console.error("Error creating branch price:", error);
    }
  };

  return (
    <div>
      <div className="border border-[#E0DDD8] p-4 rounded-lg flex flex-col gap-3 shadow-[0px_4px_12.8px_0px_rgba(0,0,0,0.09)]">
        <h2 className="text-[#3A3A3A] font-poppins text-[16px] font-semibold leading-[27px]">
          Branch Amount
        </h2>
        <div className="flex items-center w-full gap-5 pt-3">
          <Input
            className="w-[500px] "
            label="Set Branch Price "
            placeholder="₹ 20,000"
            value={branchPrice}
            onChange={(e) => setBranchPrice(e.target.value)}
          />
          <Button
            className="mt-5"
            size="addbutton"
            disabled={!canBranchingAdd || !hasBranchPrice}
            onClick={handleCreateBranchPrice}
          >
            <Plus />
            Add Branch Price
          </Button>
        </div>
        <p className="text-[#393636] font-inter text-[12px] font-normal [font-feature-settings:'liga'_off,'clig'_off]">
          The amount always same for every center to make branches
        </p>
      </div>
    </div>
  );
};

export default AddBranchPrice;
