import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import {
  useSuperadminProfileQuery,
  useUpdateSuperadminProfileMutation,
} from "@api-queries/super-admin/profile/Query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { superadminValidationSchema } from "@utils/validations";

const AdminProfileModal = ({ open, setOpen }) => {
  const { data, isFetching } = useSuperadminProfileQuery();
  const { mutateAsync: updateProfile, isPending } =
    useUpdateSuperadminProfileMutation();

  const initialValues = {
    fullname: data?.fullname || "",
    email: data?.email || "",
    mobile: data?.mobile || "",
    whatsapp_number: data?.whatsapp_number || "",
    profile_photo: null,
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: superadminValidationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("fullname", values.fullname);
      formData.append("email", values.email);
      formData.append("mobile", values.mobile);
      formData.append("whatsapp_number", values.whatsapp_number);

      if (values.profile_photo) {
        formData.append("profile_photo", values.profile_photo);
      }

      await updateProfile(formData);
      setOpen(false);
    },
  });

  const fileRef = useRef(null);
  const [image, setImage] = useState(null);

  const handleImageClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      formik.setFieldValue("profile_photo", file);
      formik.setFieldTouched("profile_photo", true, false);
    }
  };

  return (
    <CustomeModal
      className="lg:w-[600px]"
      open={open}
      onOpenChange={setOpen}
      header="My Profile"
    >
      <form onSubmit={formik.handleSubmit}>
        {/* Profile Image */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <img
              src={image || data?.profile_photo}
              alt="User"
              loading="lazy"
              className="w-32 h-32 rounded-full border-2 border-bordergreylight"
            />

            {/* Camera Icon */}
            <button
              type="button"
              onClick={handleImageClick}
              className="absolute -right-2 bottom-0 bg-primary w-8 h-8 rounded-full flex justify-center items-center shadow-md"
            >
              <Camera size={16} className="text-white" />
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          <Input
            label="Full Name"
            name="fullname"
            value={formik.values.fullname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fullname && formik.errors.fullname}
          />
          <Input
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
          />
          <Input
            label="Phone"
            name="mobile"
            value={formik.values.mobile}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.mobile && formik.errors.mobile}
          />
          <Input
            label="WhatsApp Number"
            name="whatsapp_number"
            value={formik.values.whatsapp_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.whatsapp_number && formik.errors.whatsapp_number
            }
          />
        </div>

        {/* Submit */}
        <div className="w-full flex items-center justify-end mt-6">
          <Button
            size="addbutton"
            type="submit"
            disabled={isPending || isFetching}
          >
            Submit
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default AdminProfileModal;
