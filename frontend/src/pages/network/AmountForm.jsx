import React from "react";
import CustomeModal from "@common/components/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import {
  useAddNetworkAmountMutation,
  useGetNetworkAmountQuery,
} from "@api-queries/center-admin/network/Query";
import { useAuthStore } from "@store/authStore";
import { useFormik } from "formik";

const AmountForm = ({ open, setOpen }) => {
  const centerId = useAuthStore.getState()?.auth?.center_id;
  const { mutateAsync: addAmount, isPending } = useAddNetworkAmountMutation();
  const { data, isLoading } = useGetNetworkAmountQuery(centerId);

  const formik = useFormik({
    initialValues: {
      amount: data?.networking_amount || "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await addAmount(values);
        formik.resetForm();
        setOpen(false);
      } catch (error) {
        console.error("Failed to save network amount:", error);
      }
    },
  });

  return (
    <CustomeModal open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        <h2 className="text-[20px] leading-[30px] font-semibold">
          Please set your Network amount per day for a user
        </h2>

        <Input
          placeholder="Enter Amount"
          name="amount"
          type="number"
          min="0"
          value={formik.values.amount}
          onChange={formik.handleChange}
        />

        <div className="flex justify-end gap-3">
          <Button
            size="addbutton"
            variant="outline_secondary"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            size="addbutton"
            type="submit"
            disabled={isPending || isLoading || !formik.values.amount}
          >
            {isPending ? "Saving..." : "Submit"}
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default AmountForm;
