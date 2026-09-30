import { useEffect, useState } from "react";
import styles from "../styles/Payment.module.css";

export default function Payment() {
  const [checkoutId, setCheckoutId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState(null);
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
      setPaymentLinkUrl(data.paymentLinkUrl);
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
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner}></div>
          <h1 className={styles.title}>Preparing Payment</h1>
          <p className={styles.description}>
            Please wait while we prepare your payment.
          </p>
        </div>
      </div>
    );
  }

  if (!checkoutId) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconCircle}>!</div>

          <h1 className={styles.title}>Checkout Not Found</h1>

          <p className={styles.description}>
            We couldn't find your checkout session.
          </p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconCircle}>!</div>

          <h1 className={styles.title}>Payment Failed</h1>

          <p className={styles.description}>
            Something went wrong while creating your payment.
          </p>

          <button
            className={styles.secondaryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.paymentIcon}>
          <span>✓</span>
        </div>

        <h1 className={styles.title}>Complete Your Payment</h1>

        <p className={styles.description}>
          Your order is ready. Complete the payment securely through Xendit.
        </p>

        <div className={styles.amountBox}>
          <span className={styles.amountLabel}>Total Amount</span>
          <span className={styles.amount}>
            {formatRupiah(payment.amount)}
          </span>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Payment ID</span>
            <span>{payment.paymentId}</span>
          </div>

          <div className={styles.detailRow}>
            <span>Status</span>
            <span className={styles.status}>{payment.status}</span>
          </div>
        </div>

        <button
          className={styles.payButton}
          onClick={() => {
            window.location.href = paymentLinkUrl;
          }}
          disabled={!paymentLinkUrl}
        >
          Pay Now with Xendit
          <span>→</span>
        </button>

        <p className={styles.secureText}>
          Secure payment powered by Xendit
        </p>
      </div>
    </div>
  );
}