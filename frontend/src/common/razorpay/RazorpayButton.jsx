import React from "react";

const RazorpayButton = ({
  amount = 50000, // Amount in paise (₹500)
  orderId,        // Optional: Razorpay order_id from backend
  onSuccess,
  onFailure,
}) => {
  const handlePayment = () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key
      amount: amount,
      currency: "INR",
      name: "Your Company Name",
      description: "Test Transaction",
      order_id: orderId, // Optional: order_id from backend
      handler: function (response) {
        if (onSuccess) onSuccess(response);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Your Company Address",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handlePayment} className="px-4 py-2 bg-primary text-white rounded">
      Pay with Razorpay
    </button>
  );
};

export default RazorpayButton;