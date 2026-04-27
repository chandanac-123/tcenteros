import { Input } from "@pages/components/ui/input";
import React from "react";
import SettingToggleCard from "../components/SettingsToggleCard";
import { settingsConfig } from "@constants/general_setting";
import { Button } from "@pages/components/ui/button";
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from "@api-queries/super-admin/platform-settings/Query";
import { useFormik } from "formik";

const GeneralSettings = () => {
  const { data, isLoading } = useGetPlatformSettingsQuery();
  const settingsData = data?.data?.[0] || {};
  const { mutateAsync: updateSettings, isPending: isUpdating } =
    useUpdatePlatformSettingsMutation();

  const toggleFieldMap = {
    renewalReminder: "automated_renewal_reminder",
    autoSuspension: "automated_suspensions",
    autoReactivation: "automated_reactivations",
    commission: "automated_commission_calculations",
    forecast: "automated_revenue_forecasting",
    paymentRetries: "automated_payment_retries",
    gracePeriod: "automated_grace_period_entry",
  };

  const initialValues = {
    default_yearly_discount: settingsData.default_yearly_discount ?? "",
    default_partner_commission:
      settingsData.default_partner_commission ?? "",
    partner_renewal_commission:
      settingsData.partner_renewal_commission ?? "",
    grace_period_days: settingsData.grace_period_days ?? "",
    payment_retry_attempts: settingsData.payment_retry_attempts ?? "",
    automated_renewal_reminder:
      settingsData.automated_renewal_reminder ?? false,
    automated_suspensions: settingsData.automated_suspensions ?? false,
    automated_reactivations: settingsData.automated_reactivations ?? false,
    automated_commission_calculations:
      settingsData.automated_commission_calculations ?? false,
    automated_revenue_forecasting:
      settingsData.automated_revenue_forecasting ?? false,
    automated_payment_retries: settingsData.automated_payment_retries ?? false,
    automated_grace_period_entry:
      settingsData.automated_grace_period_entry ?? false,
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateSettings(values);
    },
  });

  const handleToggle = (key) => {
    const fieldName = toggleFieldMap[key];
    formik.setFieldValue(fieldName, !formik.values[fieldName]);
  };

  return (
    <form className="flex flex-col gap-8 mt-4" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col p-4 rounded-lg space-y-4 shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
        <span className="text-grey font-semibold">
          Revenu & Subscription Management
        </span>

        <div className="grid grid-cols-2 gap-4 ">
          <Input
            label="Default Yearly Discount (%)"
            name="default_yearly_discount"
            type="number"
            placeholder="Enter yearly discount"
            value={formik.values.default_yearly_discount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading || isUpdating}
          />
          <Input
            label="Default Partner Commission (%)"
            name="default_partner_commission"
            type="number"
            placeholder="Enter partner commission"
            value={formik.values.default_partner_commission}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading || isUpdating}
          />
          <Input
            label="Partner Renewal Commission"
            name="partner_renewal_commission"
            type="number"
            placeholder="Enter renewal commission"
            value={formik.values.partner_renewal_commission}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading || isUpdating}
          />
          <Input
            label="Grace Period (Days)"
            name="grace_period_days"
            type="number"
            placeholder="Enter grace period days"
            value={formik.values.grace_period_days}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading || isUpdating}
          />
          <Input
            label="Payment Retry Attempts"
            name="payment_retry_attempts"
            type="number"
            placeholder="Enter payment retry attempts"
            value={formik.values.payment_retry_attempts}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isLoading || isUpdating}
          />
        </div>
      </div>

      <div className="flex flex-col p-4 space-y-4 rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
        <span className="text-grey font-semibold">Automation Controls</span>
        <div className="flex flex-col gap-4">
          {settingsConfig.map((item) => (
            <SettingToggleCard
              key={item.key}
              title={item.title}
              description={item.description}
              checked={formik.values[toggleFieldMap[item.key]]}
              onChange={() => handleToggle(item.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="addbutton" type="submit" disabled={isLoading || isUpdating}>
          Save Settings
        </Button>
      </div>
    </form>
  );
};

export default GeneralSettings;
