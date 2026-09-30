export default function PaymentCancel() {
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
        <h1>Payment Cancelled</h1>

        <p>
          Your payment was cancelled or you did not complete
          the payment.
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
      </div>
    </div>
  );
}