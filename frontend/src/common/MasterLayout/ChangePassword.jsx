
import { useChangePasswordMutation } from "@api-queries/super-admin/profile/Query";
import CustomeModal from "@common/components/CustomeModal";
import PasswordInput from "@common/components/PasswordInput";
import { Button } from "@pages/components/ui/button";
import { Spinner } from "@pages/components/ui/spinner";
import { changePasswordValidationSchema } from "@utils/validations";
import { useFormik } from "formik";

const ChangePassword = ({ open, setOpen }) => {
    const { mutateAsync: change_password, isPending } =
        useChangePasswordMutation()

    const formik = useFormik({
        initialValues: {
            current_password: '',
            new_password: '',
            confirm_password: '',
        },
        validationSchema: changePasswordValidationSchema,
        onSubmit: async (values) => {
            try {
                await change_password(values)
                setOpen(false)
            } catch (error) {
            }
        },
    })

    return (
        <CustomeModal open={open} onOpenChange={setOpen} title="Change Password">
            <div className="flex flex-col min-w-lg w-full">
                <form onSubmit={formik.handleSubmit} className="w-full space-y-4">
                    <PasswordInput
                        label="Current Password"
                        name="current_password"
                        placeholder="Current Password"
                        iconPosition="end"
                        value={formik.values.current_password}
                        onChange={formik.handleChange}
                    />
                    <PasswordInput
                        label="New Password"
                        name="new_password"
                        placeholder="New Password"
                        iconPosition="end"
                        value={formik.values.new_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.new_password
                            && formik.errors.new_password

                        }
                    />

                    <PasswordInput
                        label="Confirm Password"
                        name="confirm_password"
                        placeholder="Confirm Password"
                        iconPosition="end"
                        value={formik.values.confirm_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                            formik.touched.confirm_password
                            && formik.errors.confirm_password

                        }
                    />
                    <div className="flex justify-center gap-4">
                        <Button
                            type="submit"
                            size="addbutton"
                            variant="default"
                            disabled={isPending}
                        >
                            {isPending ? <Spinner /> : 'Change Password'}
                        </Button>
                    </div>

                </form>
            </div>
        </CustomeModal>
    );
};

export default ChangePassword;
