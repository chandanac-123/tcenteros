import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import { Input } from '@pages/components/ui/input'
import { Checkbox } from '@pages/components/ui/checkbox'
import { Mail, User, Phone, MapPinCheck, CalendarClock, MapPinCheckIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { useState } from 'react'
import { useCreateOnboardCenterMutation } from '@api-queries/center-admin/on-boarding/Query'
import { useOnboardingStore } from '@store/onboardingStore'
import { onboardingValidationSchema } from '@utils/validations'
import people_icon from '@assets/form-icons/people.svg'
import CustomeSelect from '@common/components/CustomeSelect'
import CitySelect from '@common/components/CitySelect'
import { useAuthStore } from '@store/authStore'

const packageOptions = [
  { id: "monthly", name: "Monthly" },
  { id: "yearly", name: "Yearly" },
];

const ContactDetails = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const { mutateAsync: create, isPending } = useCreateOnboardCenterMutation()
  const store = useOnboardingStore()
  const setOnboardId = useOnboardingStore(state => state.setOnboardId)
  const setUserNumber = useAuthStore(state => state.setUserNumber)

  const enabledFeatureIds = Object.values(store?.centerTools || {})
    .filter((tool) => tool?.enabled === true)
    .map((tool) => tool.feature_id);

  const initialValues = {
    center_name: store.center_name || "",
    contact_person: store.contact_person || "",
    center_email: store.center_email || "",
    center_phone: store.center_phone || "",
    city: store.city || "",
    is_terms_and_conditions: Boolean(store.is_terms_and_conditions) || false,
    center_category_id: store?.typeSelectionId || "",
    kind_of_center: store.kind_of_center || "Hybrid",
    members_count:
      store.memberCount === "500+"
        ? 525
        : store.memberCount?.split("-")[1]
          ? parseInt(store.memberCount.split("-")[1], 10)
          : 50,
    trainer_count:
      store.trainerCount === "10+"
        ? 21
        : store.trainerCount?.split("-")[1]
          ? parseInt(store.trainerCount.split("-")[1], 10)
          : 5,
    currently_using_digital_tool: store.digitalToolsSelected || [],
    marketing_platform: store.marketingSupportType
      ? store.marketingSupportType
      : [],
    platform_feature_ids: store.centerTools ? enabledFeatureIds : [],
    subscription_duration: "",
  };

  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: onboardingValidationSchema,
    onSubmit: async (values) => {
      try {
        setErrorMessage("");
        const response = await create(values)
        setUserNumber(values.center_phone)
        if (response?.id) {
          setOnboardId(response.id);
        }
        setSubmitted(true);
        navigate("/pricing-page");
        // optional smooth scroll
        window.scrollTo({ top: 0, behavior: "smooth" });

        formik.resetForm();
      } catch (error) {
        console.log("error: ", error?.response?.data?.detail);
        setErrorMessage(error?.response?.data?.detail)
      }
    },
  });

  return (
    <SecondaryLayout>
      <div className="flex flex-col h-screen">
        <OnboardHeader />

        {/* 🔥 Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-10">
          <div className="flex flex-col gap-1 mb-6 text-xl font-medium">
            Let’s Set This Up for You
            {errorMessage && (
              <span className="text-sm text-red_text">
                {errorMessage}
              </span>
            )}

          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Left */}
            <div className="w-full md:w-1/2">
              <form
                id="contact-details-form"
                className="space-y-3"
                onSubmit={formik.handleSubmit}
              >
                <Input
                  label="Center Name"
                  name="center_name"
                  placeholder="Center Name"
                  icon={
                    <img
                      src={people_icon}
                      alt=""
                      loading="lazy"
                      className="w-6 h-6 mr-2"
                    />
                  }
                  value={formik.values.center_name}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.center_name && formik.errors.center_name
                  }
                />

                <Input
                  label="Contact Person"
                  name="contact_person"
                  icon={<User className="w-5 h-5 mr-2 text-onboard_primary" />}
                  value={formik.values.contact_person}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.contact_person &&
                    formik.errors.contact_person
                  }
                />

                <Input
                  label="Email"
                  name="center_email"
                  icon={<Mail className="w-5 h-5 mr-2 text-onboard_primary" />}
                  value={formik.values.center_email}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.center_email && formik.errors.center_email
                  }
                />

                <Input
                  label="Phone"
                  name="center_phone"
                  icon={<Phone className="w-5 h-5 mr-2 text-onboard_primary" />}
                  value={formik.values.center_phone}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.center_phone && formik.errors.center_phone
                  }
                />

                <CitySelect
                  icon={<MapPinCheckIcon className='w-5 h-5 mr-2 text-onboard_primary' />}
                  country={formik.values.countryCode}
                  value={formik.values.city}
                  onChange={(data) => {
                    formik.setFieldValue("city", data.city);
                  }}
                  label="City"
                />

                <CustomeSelect
                  label="Subscription Duration"
                  options={packageOptions}
                  icon={
                    <CalendarClock className="w-5 h-5 text-onboard_primary" />
                  }
                  value={formik.values.subscription_duration}
                  onChange={(val) =>
                    formik.setFieldValue("subscription_duration", val)
                  }
                  error={
                    formik.touched.subscription_duration &&
                    formik.errors.subscription_duration
                  }
                />

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formik.values.is_terms_and_conditions}
                      onCheckedChange={(val) =>
                        formik.setFieldValue("is_terms_and_conditions", val)
                      }
                    />
                    <label className="text-sm">I agree to be contacted</label>
                  </div>

                  {formik.touched.is_terms_and_conditions &&
                    formik.errors.is_terms_and_conditions && (
                      <span className="text-xs text-red_text mt-1 ml-6">
                        {formik.errors.is_terms_and_conditions}
                      </span>
                    )}
                </div>
              </form>
            </div>

            {/* Right */}
            <div className="w-full md:w-1/2 flex flex-col gap-4 justify-center items-center text-center">
              <span className="text-3xl font-semibold  text-onboard_secondary">
                Almost there!
              </span>
              <span className="text-base">
                To unlock your custom pricing and send a copy of this
                recommendation to your inbox, just let us know where to reach
                you.
              </span>
            </div>
          </div>
        </div>

        {/* 🔥 Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t px-4 sm:px-10 py-4 flex justify-between">
          <Button
            variant="outline_secondary"
            size="sm"
            leftIcon={backarrow}
            onClick={() => navigate("/marketing-support")}
          >
            Back
          </Button>

          {!submitted && (
            <Button
              variant="onboard_outline_primary"
              rightIcon={rightcolorarrow}
              type="submit"
              form="contact-details-form"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </SecondaryLayout>
  );
};

export default ContactDetails;

{
  /* <Button
              variant='onboard_outline_primary'
              rightIcon={rightcolorarrow}
              onClick={() => navigate('/pricing-page')}
            >
              View My Pricing
            </Button> */
}
