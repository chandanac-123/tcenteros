import React, { useState } from "react";
import { Input } from "@pages/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = React.forwardRef(({ label, error, className, ...props }, ref) => {
	const [show, setShow] = useState(false);
	return (
		<Input
			ref={ref}
			label={label}
			error={error}
			type={show ? "text" : "password"}
			className={className}
			icon={
				<button
					type="button"
					tabIndex={-1}
					onClick={() => setShow((v) => !v)}
					className="focus:outline-none"
				>
					{show ? <EyeOff size={18} /> : <Eye size={18} />}
				</button>
			}
			{...props}
		/>
	);
});
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
