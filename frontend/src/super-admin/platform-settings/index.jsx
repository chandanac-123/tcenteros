import { useState } from "react";
import CustomeTab from "@common/components/CustomeTab";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Settings } from "lucide-react";

import GeneralSettings from "./general-settings";
import LegalDocuments from "./legal-documents";
import CenterType from "./center-type";
import TaxCategorySettings from "@pages/settings/TaxCategorySettings";
import FAQpages from "./FAQs";

const settingType = [
  { id: "general", name: "General Settings", component: GeneralSettings },
  { id: "type", name: "Center Type", component: CenterType },
  { id: "tax-settings", name: "Tax Settings", component: TaxCategorySettings },
  { id: "legal", name: "Legal Documents", component: LegalDocuments },
  { id: "faq", name: "FAQs", component: FAQpages },
];

const PlatformSettings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const activeTabData = settingType.find(
    (tab) => tab.id === activeTab
  );

  const ActiveComponent = activeTabData?.component;

  return (
    <ContentLayout>
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-4">
        <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          <Settings
            size={24}
            className="text-onboard_primary sm:w-[30px] sm:h-[30px]"
          />
        </div>

        <div className="flex flex-col justify-center gap-1 sm:gap-2">
          <h1 className="text-base sm:text-[18px] font-semibold text-[#3A3A3A]">
            Platform Settings
          </h1>

          <p className="text-xs sm:text-[14px] font-medium text-[#393636]">
            Configure platform-wide revenue and subscription settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto px-2 sm:px-4">
        <CustomeTab
          tabList={settingType}
          defaultVal={activeTab}
          tabsListClass="p-[1px] min-w-max"
          onChange={setActiveTab}
        />
      </div>

      {/* Content */}
      <div className="mt-4 px-2 sm:px-0">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </ContentLayout>
  );
};

export default PlatformSettings;