import {
  useAddAccountMutation,
  useAccountDetailQuery,
} from "@api-queries/partner/account-details/Query";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import { accountValidationSchema } from "@utils/validations";
import { useFormik } from "formik";
import { Landmark, Save } from "lucide-react";
import React from "react";

const AccountDetails = () => {
  const { mutateAsync: add_account } = useAddAccountMutation();
  const { data } = useAccountDetailQuery();

  const initialValues = {
    account_holder_name: data?.account_holder_name || "",
    bank_name: data?.bank_name || "",
    account_number: data?.account_number || "",
    ifsc_code: data?.ifsc_code || "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnMount: true,
    validationSchema: accountValidationSchema(),
    onSubmit: async (values) => {
      try {
        await add_account(values);
        formik.resetForm();
      } catch (error) {}
    },
  });
  
  return (
    <ContentLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Landmark size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Account Details
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              You can add and update the account details here
            </p>
          </div>
        </div>
        <div className="flex p-6 bg-primary/5 rounded-lg">
          Configure your bank account details to receive direct commission
          payouts and manage transaction fees safely.
        </div>
        <span className="flex font-medium">Add Bank details</span>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Account Holder Name "
              name="account_holder_name"
              value={formik.values.account_holder_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.account_holder_name &&
                formik.errors.account_holder_name
              }
            />
            <Input
              label="Bank Name "
              name="bank_name"
              value={formik.values.bank_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bank_name && formik.errors.bank_name}
            />
            <Input
              label="Account Number "
              name="account_number"
              value={formik.values.account_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.account_number && formik.errors.account_number
              }
            />
            <Input
              label="IFSC Code "
              name="ifsc_code"
              value={formik.values.ifsc_code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ifsc_code && formik.errors.ifsc_code}
            />
          </div>
          <div className="flex justify-end w-full mt-4">
            <Button
              size="addbutton"
              type="submit"
              disabled={!formik.dirty || !formik.isValid}
            >
              <Save /> Save Details
            </Button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
};

export default AccountDetails;
