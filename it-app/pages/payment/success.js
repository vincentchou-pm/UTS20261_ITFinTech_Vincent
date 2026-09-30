import { useEffect, useState } from "react";
import styles from "../../styles/PaymentSuccess.module.css";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("CHECKING");
  const [checkoutId, setCheckoutId] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get(
      "checkoutId"
    );

    if (!id) {
      setStatus("ERROR");
      return;
    }

    setCheckoutId(id);

    let attempts = 0;
    const maxAttempts = 10;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/payment/status?checkoutId=${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setStatus(data.status);

        if (data.status === "LUNAS") {
          return true;
        }

        return false;
      } catch (error) {
        console.error("Payment status error:", error);
        setStatus("ERROR");
        return true;
      }
    };

    const startChecking = async () => {
      const completed = await checkPaymentStatus();

      if (completed) {
        return;
      }

      const interval = setInterval(async () => {
        attempts++;

        const completed = await checkPaymentStatus();

        if (completed || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 2000);
    };

    startChecking();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Checking */}
        {status === "CHECKING" && (
          <>
            <div className={styles.spinner}></div>

            <h1 className={styles.title}>
              Checking Payment...
            </h1>

            <p className={styles.description}>
              Please wait while we verify your payment.
            </p>
          </>
        )}

        {/* Success */}
        {status === "LUNAS" && (
          <>
            <div className={`${styles.icon} ${styles.successIcon}`}>
              ✓
            </div>

            <h1 className={styles.title}>
              Payment Successful!
            </h1>

            <p className={styles.description}>
              Your payment has been successfully completed.
              Thank you for your purchase!
            </p>

            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              Payment Completed
            </div>

            <div className={styles.checkoutBox}>
              <span className={styles.checkoutLabel}>
                Checkout ID
              </span>

              <span className={styles.checkoutId}>
                {checkoutId}
              </span>
            </div>

            <button
              className={styles.primaryButton}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to Home
              <span>→</span>
            </button>
          </>
        )}

        {/* Pending */}
        {status === "PENDING" && (
          <>
            <div className={`${styles.icon} ${styles.pendingIcon}`}>
              ...
            </div>

            <h1 className={styles.title}>
              Payment Processing
            </h1>

            <p className={styles.description}>
              Your payment has been received and is still
              being processed.
            </p>

            <div className={styles.pendingBox}>
              Please wait a moment before checking again.
            </div>
          </>
        )}

        {/* Error */}
        {status === "ERROR" && (
          <>
            <div className={`${styles.icon} ${styles.errorIcon}`}>
              !
            </div>

            <h1 className={styles.title}>
              Something Went Wrong
            </h1>

            <p className={styles.description}>
              We could not verify your payment status.
              Please try again later.
            </p>

            <button
              className={styles.secondaryButton}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}