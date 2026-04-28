import { Input } from "@pages/components/ui/input";
import React from "react";
import { Button } from "@pages/components/ui/button";
import {
  useCreateCenterTypeMutation,
  useDeleteCenterTypeMutation,
  useGetCenterTypeQuery,
} from "@api-queries/super-admin/platform-settings/Query";
import { useFormik } from "formik";
import InputFile from "@common/components/CustomeFileUpload";
import CenterTypeCard from "./CenterTypeCard";

const CenterType = () => {
  const { data, isLoading } = useGetCenterTypeQuery();
  const { mutateAsync: createCenterType, isPending } =
    useCreateCenterTypeMutation();
  const { mutateAsync: deleteCenterType, isPending: isDeleting } =
    useDeleteCenterTypeMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      image: null,
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        if (values.image) {
          formData.append("image", values.image);
        }
        await createCenterType(formData);
        resetForm();
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <form className="flex flex-col gap-8 mt-4" onSubmit={formik.handleSubmit}>
      {/* Add Center Type */}
      <div className="flex flex-col p-4 rounded-lg space-y-4 shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
        <span className="text-grey font-semibold">Add Center Type</span>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Set Center Type Name"
            name="name"
            type="text"
            placeholder="Enter center type name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <InputFile
            label="Upload Image Of Center Type"
            name="image"
            value={formik.values.image}
            onChange={(file) => formik.setFieldValue("image", file)}
            onRemove={() => {
              formik.setFieldValue("image", null);
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button size="addbutton" type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Existing Center Types */}
      <div className="flex flex-col p-4 space-y-4 rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
        <span className="text-grey font-semibold">Existing Center Types</span>

        <div className="flex flex-col gap-4">
          {data?.length === 0 && (
            <span className="text-sm text-gray-400">No center types found</span>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.map((item) => (
              <CenterTypeCard
                key={item?.id}
                image={item?.image_url}
                title={item?.name}
                onDelete={() => deleteCenterType(item?.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default CenterType;
