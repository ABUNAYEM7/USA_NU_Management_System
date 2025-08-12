import React, { useState, useEffect } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import useAuth from "../Hooks/useAuth";
import AxiosSecure from "../Hooks/AxiosSecure";

const CheckoutForm = ({
  refetch,
  amount: initialAmount,
  studentEmail,
  courseId,
  courseName,
  isManual = false,
  manualPaymentId = null,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const axiosInstance = AxiosSecure();
  const { user } = useAuth();

  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    courseId,
    amount: initialAmount,
    courseName,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setBillingDetails((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone,
          },
        });

      if (paymentMethodError) {
        setMessage(paymentMethodError.message);
        setIsProcessing(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log("✅ PaymentMethod created:", paymentMethod.id);
      }

      const response = await axiosInstance.post("/create-payment-intent", {
        amount: billingDetails.amount,
      });

      const clientSecret = response.data.clientSecret;

      if (!clientSecret) {
        throw new Error("Failed to get client secret from server");
      }

      if (import.meta.env.DEV) {
        console.log("✅ Client Secret received:", clientSecret);
      }

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (import.meta.env.DEV) {
        console.log("🧾 Stripe PaymentIntent Status:", confirmResult.paymentIntent?.status);
      }

      if (
        confirmResult?.paymentIntent?.status === "succeeded" ||
        confirmResult?.paymentIntent?.status === "processing"
      ) {
        try {
          await axiosInstance.post("/payments", {
            transactionId: confirmResult.paymentIntent.id,
            userName: billingDetails.name,
            userEmail: billingDetails.email,
            phone: billingDetails.phone,
            courseId: isManual ? null : billingDetails.courseId,
            courseName: isManual ? null : billingDetails.courseName,
            amount: billingDetails.amount,
            status: "paid",
            date: new Date().toISOString(),
          });

          if (isManual && manualPaymentId) {
            await axiosInstance.patch(
              `/update-manual-payment-status/${manualPaymentId}`,
              { status: "paid" }
            );
          } else {
            await axiosInstance.patch(
              `/update-student-course-payment-status/${studentEmail}`,
              { courseId: billingDetails.courseId }
            );
          }

          refetch();
          setMessage("🎉 Payment Successful! Thank you!");
          cardElement.clear();
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error("❌ Error saving payment to DB:", err);
          }
          setMessage("Payment processed, but saving failed. Contact admin.");
        }
      } else if (confirmResult.error) {
        setMessage(confirmResult.error.message);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("❌ Payment error:", error.message);
      }
      setMessage(error.message || "Payment failed. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          className="input input-bordered w-full mt-1 bg-gray-100"
          value={billingDetails.name}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="input input-bordered w-full mt-1 bg-gray-100"
          value={billingDetails.email}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          className="input input-bordered w-full mt-1"
          value={billingDetails.phone}
          onChange={(e) =>
            setBillingDetails({ ...billingDetails, phone: e.target.value })
          }
          required
          placeholder="+1 234 567 8901"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
        <input
          type="number"
          className="input input-bordered w-full mt-1 bg-gray-100"
          value={billingDetails.amount}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
        <div className="p-4 border rounded-lg">
          <CardElement />
        </div>
      </div>

      {message && (
        <div className="text-center text-red-500 font-medium">{message}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn bg-prime w-full"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default CheckoutForm;
