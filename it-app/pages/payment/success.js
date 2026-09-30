import { useEffect, useState } from "react";

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

        // Kalau sudah LUNAS, berhenti polling
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {status === "CHECKING" && (
          <>
            <h1>Checking Payment...</h1>

            <p>
              Please wait while we verify your payment.
            </p>
          </>
        )}

        {status === "LUNAS" && (
          <>
            <h1>Payment Successful!</h1>

            <h2>Status: LUNAS</h2>

            <p>
              Your payment has been successfully completed.
            </p>

            <p>
              Checkout ID:
              <br />
              {checkoutId}
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
          </>
        )}

        {status === "PENDING" && (
          <>
            <h1>Payment Processing</h1>

            <p>
              Your payment has been received and is still
              being processed.
            </p>

            <p>
              Please wait a moment before checking again.
            </p>
          </>
        )}

        {status === "ERROR" && (
          <>
            <h1>Something Went Wrong</h1>

            <p>
              We could not verify your payment status.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                cursor: "pointer",
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