import React, { useState } from "react";
import logo from "@assets/header-icons/logo.svg";
import TermsDoc from "./TermsDoc";
import ChatBot from "@common/chatbot";

const PartnerLayout = ({ children }) => {
  const [termsOpen, setTermsOpen] = useState(false)
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-textblack px-4 sm:px-6 md:px-10 lg:px-16 pt-20 md:pt-24 pb-6">
      <div className="absolute left-3 top-3">
        <img src={logo} alt="Logo" loading="lazy" />
      </div>
      <div className="flex h-full w-full overflow-hidden rounded-lg bg-white">
        {children}
      </div>
      <div className="fixed bottom-14 right-6 z-[99999]">
        <ChatBot />
      </div>
      <footer className="mt-4 border-t border-white/10 pt-4">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
          <button
            onClick={() => setTermsOpen(true)}
            className="text-xs sm:text-sm text-white/50 transition-colors hover:text-white"
          >
            Terms & Conditions
          </button>
          <a
            href="https://tcenteros.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-white/50 transition-colors hover:text-white"
          >
            © 2026 TCenterOS · A product of Chayaza Private Limited
          </a>
        </div>
      </footer>
      <TermsDoc setTermsOpen={setTermsOpen} termsOpen={termsOpen} />
    </div>
  );
};

export default PartnerLayout;
