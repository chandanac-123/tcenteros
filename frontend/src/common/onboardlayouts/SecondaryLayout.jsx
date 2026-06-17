import ChatBot from "@common/chatbot"
import PrivacyPolicy from "@pages/onboarding-pages/components/PrivacyPolicy"
import TermsAndConditions from "@pages/onboarding-pages/components/TermsAndConditions"
import { useState } from "react"

const SecondaryLayout = ({ children }) => {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  return (
    <div className='fixed inset-0 min-h-screen flex flex-col bg-secondary-bg bg-cover bg-no-repeat bg-center overflow-x-auto'>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      <ChatBot/>
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-grey">
          <button
            onClick={() => setTermsOpen(true)}
            className="hover:text-onboard_primary"
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setPrivacyOpen(true)}
            className="hover:text-onboard_primary"
          >
            Privacy Policy
          </button>
        </div>
        <a
          href="https://tcenteros.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs sm:text-sm text-grey hover:text-onboard_primary"
        >
          © 2026 TCenterOS · A product of Chayaza Private Limited
        </a>
      </footer>
      <TermsAndConditions setTermsOpen={setTermsOpen} termsOpen={termsOpen} />
      <PrivacyPolicy setPrivacyOpen={setPrivacyOpen} privacyOpen={privacyOpen} />
    </div>
  )
}

export default SecondaryLayout
