import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import CustomeSelect from "@common/components/CustomeSelect";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";
import CustomeTab from "@common/components/CustomeTab";
import {
  useCreateMemberMutation,
  useMembersTimeSlotQuery,
  useMembersGetByIdQuery,
  useUpdateMemberMutation,
  useActiveMembersPlanQuery,
  useVisitorById,
  useGuestById,
} from "@api-queries/center-admin/crm/Query";
import { useFormik } from "formik";
import TimeSlotSelector from "../components/TimeSlotSelector";
import { useAuthStore } from "@store/authStore";
import { useCrmStore } from "@store/tabStore";
import { memberValidationSchema } from "@utils/validations";
import CitySelect from "@common/components/CitySelect";
import StateSelect from "@common/components/StateSelect";
import CountrySelect from "@common/components/CountrySelect";
import { useEffect, useState } from "react";
import { formatToDDMMYYYY, getChangedFields } from "@utils/helper";
import CreateMembershipForm from "@pages/membership-plan/CreateForm";
import TimeslotModal from "@pages/settings/components/TimeslotModal";
import { Eye, EyeOff } from "lucide-react";

const paidStatus = [
  { id: "unpaid", name: "Unpaid" },
  { id: "paid", name: "Paid" },
];
const paymentMethod = [
  { id: "cash", name: "Cash" },
  { id: "upi", name: "UPI" },
];
const genderOption = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
  { id: "other", name: "Other" },
];

const MemberAdd = ({ memberId, isEdit, goBack }) => {
  const centerId = useAuthStore.getState()?.auth?.center_id;
  const [planOpen, setPlanOpen] = useState(false);
  const [timeslotOpen, setTimeslotOpen] = useState(false);
  const { selectedVisitorId, selectedGuestId, clearSelectedIds } =
    useCrmStore();
  const [showPassword, setShowPassword] = useState(false);
  const { data: visitorData, isFetching: isVisitorFetching } =
    useVisitorById(selectedVisitorId);
  const { data: guestData, isFetching: isGuestFetching } =
    useGuestById(selectedGuestId);
  const { mutateAsync: createMember } = useCreateMemberMutation();
  const { mutateAsync: updateMember } = useUpdateMemberMutation();
  const { data: memberTimeSlot } = useMembersTimeSlotQuery(
    centerId
  );

  const { data: memberData, isFetching: isMemberFetching } =
    useMembersGetByIdQuery(memberId);
  const { data: memberPlan } = useActiveMembersPlanQuery();

  const sourceData = isEdit
    ? memberData
    : selectedVisitorId
      ? visitorData
      : selectedGuestId
        ? guestData
        : null;

  const generateStrongPassword = (length = 12) => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    console.log("password generated");

    const lower = "abcdefghijklmnopqrstuvwxyz";
    const number = "0123456789";
    const special = "!@#$%^&*";

    const all = upper + lower + number + special;

    let password =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      number[Math.floor(Math.random() * number.length)] +
      special[Math.floor(Math.random() * special.length)];

    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  useEffect(() => {
    if (memberPlan?.length === 0) {
      setPlanOpen(true);
    } else if (memberTimeSlot?.length === 0) {
      setTimeslotOpen(true);
    }
  }, [memberPlan, memberTimeSlot]);

  useEffect(() => {
    if (!formik.values.password) {
      const autoPassword = generateStrongPassword();
      formik.setFieldValue("password", autoPassword);
    }
  }, []);

  const initialValues = {
    center_id: centerId,
    full_name: sourceData?.full_name || "",
    email: sourceData?.email || "",
    mobile: sourceData?.mobile || "",
    gender: sourceData?.gender || "male",
    date_of_birth: formatToDDMMYYYY(sourceData?.date_of_birth) || null,
    blood_group: sourceData?.blood_group || "",
    address_line_1: sourceData?.address?.address_line_1 || "",
    address_line_2: sourceData?.address?.address_line_2 || "",
    city: sourceData?.address?.city || "",
    state: sourceData?.address?.state || "",
    country: sourceData?.address?.country || "",
    postal_code: sourceData?.address?.postal_code || "",
    membership_id: sourceData?.membership_id || "",
    time_slot_id: sourceData?.time_slot_id || "",
    member_status: "member",
    payment_method: sourceData?.payment_method || "cash",
    payment_status: sourceData?.payment_status || "unpaid",
    password: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: memberValidationSchema(isEdit),
    onSubmit: async (values) => {
      try {
        let payload = { ...values };

        const isVisitor = selectedVisitorId;
        const isGuest = selectedGuestId;

        //  1. Visitor / Guest case
        if (isVisitor && !isEdit) {
          payload = {
            membership_id: values.membership_id,
            time_slot_id: values.time_slot_id,
            member_status: "member",
            payment_method: values.payment_method || "cash",
            payment_status: values.payment_status || "unpaid",
            password: values.password || "",
          };
        }

        if (isGuest && !isEdit) {
          payload = {
            gender: values.gender,
            date_of_birth: values.date_of_birth,
            blood_group: values.blood_group,
            address_line_1: values.address_line_1,
            address_line_2: values.address_line_2,
            city: values?.city || "",
            state: values?.state || "",
            country: values?.country || "",
            postal_code: values?.postal_code || "",
            membership_id: values.membership_id,
            time_slot_id: values.time_slot_id,
            member_status: "member",
            payment_method: values.payment_method || "cash",
            payment_status: values.payment_status || "unpaid",
            password: values.password || "",
          };
        }

        //  2. Edit case → ONLY changed fields
        if (isEdit) {
          payload = getChangedFields(initialValues, values);

          // ❗ If nothing changed → stop API call
          if (Object.keys(payload).length === 0) {
            console.log("No changes detected");
            return;
          }
        }

        //  Date format (only if exists in payload)
        if (payload.date_of_birth) {
          const [day, month, year] = payload.date_of_birth.split("-");
          payload.date_of_birth = `${year}-${month}-${day}`;
        }

        //  Edit cleanup rules
        if (isEdit && sourceData?.payment_status != "unpaid") {
          delete payload.membership_id;
          delete payload.payment_method;
          delete payload.password;
          delete payload.payment_status;
        }

        //  Payment logic
        if (payload.payment_status === "unpaid") {
          delete payload.password;
          delete payload.payment_method;
        }

        //  API call
        if (isEdit || isVisitor || isGuest) {
          await updateMember({
            data: payload,
            id: memberId || selectedVisitorId || selectedGuestId,
          });
          clearSelectedIds();
          goBack();
        } else {
          await createMember(payload);
          clearSelectedIds();
          formik.resetForm();
          goBack();
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  // if (isFormLoading) {
  //   return (
  //     <div className='flex justify-center items-center h-[300px]'>
  //       <Spinner />
  //     </div>
  //   )
  // }

  const handleDateChange = (e) => {
    // Keep only numbers
    let value = e.target.value.replace(/\D/g, "");
    // Limit to 8 digits (DDMMYYYY)
    value = value.slice(0, 8);
    // Insert hyphens automatically
    if (value.length > 4) {
      value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}-${value.slice(2)}`;
    }
    formik.setFieldValue("date_of_birth", value);
  };

  // console.log('formi: ', formik.values)
  const isBlocked = memberPlan?.length === 0 || memberTimeSlot?.length === 0;
  return (
    <div className="flex flex-col gap-8">
      <CustomeBreadcrumb
        goBack={goBack}
        buttonName="Members Listing"
        currentPageName={
          isEdit ? "Member Updation Form" : "Member Creation Form"
        }
      />

      <form className="space-y-2" onSubmit={formik.handleSubmit}>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Full Name"
              name="full_name"
              value={formik.values.full_name}
              onChange={formik.handleChange}
              placeholder="Enter Your Full Name"
              error={formik.touched.full_name && formik.errors.full_name}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Email ID"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="Enter Your Email ID"
              error={formik.touched.email && formik.errors.email}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Mobile Number"
              name="mobile"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              placeholder="Enter Your Mobile Number"
              error={formik.touched.mobile && formik.errors.mobile}
            />
          </div>
          <div className="flex-1">
            <CustomeSelect
              label="Gender"
              options={genderOption}
              placeholder="Select Gender"
              value={formik.values.gender}
              onChange={(option) => formik.setFieldValue("gender", option)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Date of Birth"
              name="date_of_birth"
              placeholder="DD-MM-YYYY"
              value={formik.values.date_of_birth}
              onChange={handleDateChange}
              error={
                formik.touched.date_of_birth && formik.errors.date_of_birth
              }
            />
          </div>
          <div className="flex-1">
            <Input
              label="Blood Group"
              name="blood_group"
              value={formik.values.blood_group}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className="flex gap-4 ">
          <div className="flex-1">
            <Input
              label="Address line 1"
              name="address_line_1"
              value={formik.values.address_line_1}
              onChange={formik.handleChange}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Address line 2"
              name="address_line_2"
              value={formik.values.address_line_2}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className="flex gap-4 ">
          <div className="flex-1">
            <CitySelect
              country={formik.values.countryCode}
              value={formik.values.city}
              onChange={(data) => {
                formik.setFieldValue("city", data.city);
                formik.setFieldValue("state", data.state); // auto-fill
                formik.setFieldValue("country", data.country); // auto-fill country
              }}
              label="City"
            />
          </div>
          <div className="flex-1">
            <StateSelect
              country={formik.values.countryCode}
              value={formik.values.state}
              onChange={(val) => formik.setFieldValue("state", val)}
              label="State"
            />
          </div>
        </div>
        <div className="flex gap-4 ">
          <div className="flex-1">
            <CountrySelect
              value={formik.values.country}
              onChange={(val) => {
                formik.setFieldValue("country", val.country);
              }}
              label="Country"
            />
          </div>
          <div className="flex-1">
            <Input
              label="Pin Code"
              name="postal_code"
              value={formik.values.postal_code}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className="flex gap-4 ">
          <div className="flex-1">
            <CustomeSelect
              options={memberPlan}
              search={true}
              disabled={isEdit}
              value={formik.values.membership_id}
              onChange={(option) =>
                formik.setFieldValue("membership_id", option)
              }
              label="Membership Plan "
              error={
                formik.touched.membership_id && formik.errors.membership_id
              }
            />
          </div>
          <div className="flex-1">
            <div className="flex-1">
              <span className="text-sm">Membership Status </span>
              <div className="cursor-pointer px-4 py-1.5 rounded-md  text-onboard_primary border border-onboard_primary bg-onboard_primary/10">
                Member
              </div>
            </div>
          </div>
        </div>
        {formik?.values?.payment_status === "paid" &&
          memberData?.payment_status == "unpaid" && (
            <div className="flex gap-4 ">
              <div className="flex-1">
                <CustomeSelect
                  label="Payment Method"
                  name="payment_method"
                  options={paymentMethod}
                  value={formik.values.payment_method}
                  onChange={(value) =>
                    formik.setFieldValue("payment_method", value)
                  }
                />
              </div>
              <div className="flex-1 relative ">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  // onBlur={formik.handleBlur}
                  error={formik.touched.password && formik.errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 cursor-pointer text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

        {memberData?.payment_status == "unpaid" && (
          <div className="flex justify-end">
            <CustomeTab
              tabList={paidStatus}
              defaultVal="unpaid"
              tabsListClass="w-40 p-[1px] rounded-full"
              tabsTriggerClass="rounded-full"
              onChange={(value) =>
                formik.setFieldValue("payment_status", value)
              }
            />
          </div>
        )}
        {memberTimeSlot?.length > 0 && (
          <div className="flex justify-between items-center pt-4">
            <span className="text-md font-semibold">Select Time Slot</span>
            <Button
              type="button"
              size="addbutton"
              onClick={() => setTimeslotOpen(true)}
            >
              Add Time Slot
            </Button>
          </div>
        )}
        <div className="flex flex-col">
          <TimeSlotSelector
            slots={memberTimeSlot}
            selectedSlot={formik.values.time_slot_id}
            onChange={(id) => formik.setFieldValue("time_slot_id", id)}
          />
          {formik.touched.time_slot_id && formik.errors.time_slot_id && (
            <p className="text-red_text text-sm">
              {formik.errors.time_slot_id}
            </p>
          )}
        </div>

        <div className="flex justify-center mt-4 ">
          <Button
            size="addbutton"
            variant="default"
            type="submit"
            disabled={isBlocked}
          >
            {isEdit ? "Update Member" : "Create Member"}
          </Button>
        </div>
      </form>
      <CreateMembershipForm open={planOpen} setOpen={setPlanOpen} />
      <TimeslotModal open={timeslotOpen} onOpenChange={setTimeslotOpen} />
    </div>
  );
};

export default MemberAdd;
