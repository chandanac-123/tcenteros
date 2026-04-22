import ContentLayout from "@common/MasterLayout/ContentLayout";
import { getGreeting } from "@utils/helper";
import React, { useEffect, useState } from "react";

const PartnerDashboard = () => {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 300000); //  every 5 min is enough
    return () => clearInterval(interval);
  }, []);

  return (
    <ContentLayout>
      <div className="flex flex-col">
        <span>{greeting}</span>
        <span className="text-xs">
          Start managing leads and track your earnings below.
        </span>
        
      </div>
    </ContentLayout>
  );
};

export default PartnerDashboard;
