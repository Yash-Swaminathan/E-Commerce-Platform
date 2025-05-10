"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function CheckoutForm({ orderId, amount }: { orderId: number; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Payment successful!");
        router.push("/payment-success");
      }
    } catch (err) {
      toast.error("An error occurred during payment processing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
      <div className="mb-6">
        <p className="text-gray-600">Order Total: ${amount.toFixed(2)}</p>
      </div>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full mt-6 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<{ id: number; amount: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = localStorage.getItem("currentOrderId");
        if (!orderId) {
          router.push("/cart");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/api/orders/${orderId}`
        );
        setOrderDetails(response.data);

        const paymentResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/api/payments`,
          {
            orderId: response.data.id,
            userId: localStorage.getItem("userId"),
            amount: response.data.total,
            currency: "USD",
          }
        );
        setClientSecret(paymentResponse.data.clientSecret);
      } catch (error) {
        toast.error("Failed to load order details");
        router.push("/cart");
      }
    };

    fetchOrderDetails();
  }, [router]);

  if (!clientSecret || !orderDetails) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
          },
        }}
      >
        <CheckoutForm orderId={orderDetails.id} amount={orderDetails.amount} />
      </Elements>
    </div>
  );
} 