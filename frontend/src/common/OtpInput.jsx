import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@pages/components/ui/input-otp";

const OtpInput = ({ maxLength = 6, ...props }) => (
  <InputOTP maxLength={maxLength} {...props}>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
);

export default OtpInput;
