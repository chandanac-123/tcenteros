import React from "react";
import logo from "@assets/header-icons/logo.svg";
const PartnerLayout = ({ children }) => {
  return (
    <div className="relative flex h-screen w-full bg-textblack pt-24 pb-16 px-16">
      <div className="absolute left-3 top-3">
        <img src={logo} alt="Logo" />
      </div>
      <div className="flex h-full w-full overflow-hidden rounded-lg bg-white">
        {children}
      </div>
    </div>
  );
};

export default PartnerLayout;
