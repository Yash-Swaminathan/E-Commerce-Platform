"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");
    const redirectStatus = searchParams.get("redirect_status");

    if (redirectStatus === "succeeded") {
      toast.success("Payment successful!");
      // Clear the current order from localStorage
      localStorage.removeItem("currentOrderId");
    } else {
      toast.error("Payment failed. Please try again.");
      router.push("/checkout");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Thank You for Your Order!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. We'll send you an email with your order
          details.
        </p>
        <div className="space-y-4">
          <Link
            href="/orders"
            className="block w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          >
            View Your Orders
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 