import { Card } from "@pages/components/ui/card";
import { Input } from "@pages/components/ui/input";
import { Switch } from "@pages/components/ui/switch";
import React, { useState } from "react";
import SettingToggleCard from "../components/SettingsToggleCard";
import { settingsConfig } from "@constants/general_setting";
import { Button } from "@pages/components/ui/button";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    renewalReminder: false,
    autoSuspension: true,
    autoReactivation: true,
    commission: true,
    forecast: true,
    paymentRetries: true,
    gracePeriod: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <form className="flex flex-col gap-8 mt-4">
        <div className="flex flex-col p-4 rounded-lg space-y-4 shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          <span className="text-grey font-semibold">
            Revenu & Subscription Management
          </span>

          <div className="grid grid-cols-2 gap-4 ">
            <Input
              label="Default Yearly Discount (%)"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
            <Input
              label="Default Partner Commission (%)"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
            <Input
              label="Grace Period (Days)"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
            <Input
              label="Payment Retry Attempts"
              name="mobile"
              placeholder="Enter Your Mobile Number"
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
                checked={settings[item.key]}
                onChange={() => handleToggle(item.key)}
              />
            ))}
          </div>
        </div>

      <div className="flex justify-end">
        <Button size="addbutton" type="submit">
          Save Settings
        </Button>
      </div>
    </form>
  );
};

export default GeneralSettings;
