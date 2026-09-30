import { Plus_Jakarta_Sans } from "next/font/google";
import styles from "../../styles/Payment.module.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function PaymentCancel() {
  return (
    <div className={`${styles.page} ${jakarta.className}`}>
      <main className={styles.paymentCard}>
        <div className={styles.cancelIcon}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        <h1>Payment Cancelled</h1>

        <p className={styles.description}>
          Your payment was cancelled or you did not complete
          the payment.
        </p>

        <button
          className={styles.payButton}
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Back to Home
        </button>
      </main>
    </div>
  );
}