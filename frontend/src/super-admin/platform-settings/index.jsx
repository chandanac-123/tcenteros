import CustomeTab from "@common/components/CustomeTab";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Settings } from "lucide-react";
import { useState } from "react";
import GeneralSettings from "./general-settings";
import LegalDocuments from "./legal-documents";
import CenterType from "./center-type";

const settingType = [
  { id: "general", name: "General Settings", component: GeneralSettings },
  { id: "type", name: "Center Type", component: CenterType },
  { id: "legal", name: "Legal Documents", component: LegalDocuments },
];

const PlatformSettings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const activeTabData = settingType.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <ContentLayout>
      <div>
        <div className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Settings size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Platform Settings
            </h1>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Configure platform-wide revenue and subscription settings
            </p>
          </div>
        </div>
      </div>

      <CustomeTab
        tabList={settingType}
        defaultVal={activeTab}
        tabsListClass="p-[1px] w-max"
        onChange={setActiveTab}
      />

      <div >
        {ActiveComponent && <ActiveComponent />}
      </div>
    </ContentLayout>
  );
};

export default PlatformSettings;