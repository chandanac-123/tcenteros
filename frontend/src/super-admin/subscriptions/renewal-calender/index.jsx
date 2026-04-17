import CustomDatePicker from "@common/components/CustomeDatepicker";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import React from "react";

const RenewalCalender = () => {
  return (
    <ContentLayout>
      <CustomDatePicker pickerType="month" />
    </ContentLayout>
  );
};

export default RenewalCalender;
