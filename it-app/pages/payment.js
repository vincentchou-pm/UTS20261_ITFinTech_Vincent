import { useEffect, useState } from "react";

export default function Payment() {
  const [checkoutId, setCheckoutId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCheckoutId = localStorage.getItem("checkoutId");

    if (!savedCheckoutId) {
      setLoading(false);
      return;
    }

    setCheckoutId(savedCheckoutId);

    createPayment(savedCheckoutId);
  }, []);

  const createPayment = async (checkoutId) => {
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment creation failed");
      }

      setPayment(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return <p>Creating payment...</p>;
  }

  if (!checkoutId) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Payment</h1>
        <p>Checkout tidak ditemukan.</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Payment</h1>
        <p>Failed to create payment.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Payment</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "500px",
        }}
      >
        <p>
          <strong>Payment ID:</strong>
        </p>

        <p>{payment.paymentId}</p>

        <p>
          <strong>Amount:</strong>
        </p>

        <p>{formatRupiah(payment.amount)}</p>

        <p>
          <strong>Status:</strong>
        </p>

        <p>{payment.status}</p>

        <button
          onClick={() => {
            alert("Payment gateway will be connected here.");
          }}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}