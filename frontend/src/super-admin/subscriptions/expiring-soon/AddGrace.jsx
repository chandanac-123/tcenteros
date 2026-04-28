import CustomeModal from "@common/components/CustomeModal";
import React from "react";

const AddGrace = ({ graceOpen, setGraceOpen }) => {
  return (
    <CustomeModal
      open={graceOpen}
      onOpenChange={setGraceOpen}
      header="Add Grace"
    >
      bb
    </CustomeModal>
  );
};

export default AddGrace;
