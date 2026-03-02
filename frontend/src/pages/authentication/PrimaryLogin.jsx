import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import AuthHeader from './components/AuthHeader'
import { useState } from 'react'
import { useCreateCenterAccountMutation } from '@api-queries/authentication/Query'
import { toast } from 'sonner'
import NetworkWalletModal from './components/NetworkWalletModal'
import { showError, showSuccess } from '@utils/toast'

const PrimaryLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showOptionWallet, setOptionWalletModal] = useState(false);
  const [walletStep, setWalletStep] = useState(null);

  const { mutateAsync, isPending } = useCreateCenterAccountMutation();


  // ::::: Functions ::::: //

  //  remove error when typing
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  //  map backend validation errors
  const formatValidationErrors = (errorResponse) => {
    const formatted = {};
    const apiErrors = errorResponse?.response?.data?.detail;

    if (!Array.isArray(apiErrors)) return formatted;

    apiErrors.forEach((err) => {
      const field = err.loc?.[1];
      if (!field) return;

      const key =
        field === "confirm_password"
          ? "confirmPassword"
          : field;

      formatted[key] = err.msg;
    });

    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  inline mismatch error
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      await mutateAsync({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      setOptionWalletModal(true);
      setWalletStep("networkWalletModal");
      showSuccess("Password set successfully");
      setErrors({});

    } catch (error) {

      console.log(error);
      const status = error?.response?.status;
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Something went wrong";
      // show toast only for non-validation errors
      if (status && status !== 422) {
        showError(message);
      }
      const formattedErrors = formatValidationErrors(error);
      setErrors(formattedErrors);

    }
  };

  return (
    <>
      {walletStep === null && (
        <AuthHeader title="Set Password for center" description="">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email ID"
              name="email"
              placeholder="Enter Your Email ID"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <PasswordInput
              label="Create Password"
              name="password"
              placeholder="Create Password"
              iconPosition="end"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm Password"
              iconPosition="end"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button
              variant="button_filled"
              size="sm"
              className="w-full mt-4"
              disabled={isPending}
            >
              {isPending ? "Please wait..." : "Log in"}
            </Button>
          </form>

        </AuthHeader>
      )}
      {walletStep === "networkWalletModal" && (
        <NetworkWalletModal
          open={showOptionWallet}
          setOpen={(value) => {
            setOptionWalletModal(value);

            // 👇 when modal closes → return to login
            if (!value) {
              setWalletStep(null);
            }
          }}
        />
      )}

    </>


  );
};

export default PrimaryLogin;