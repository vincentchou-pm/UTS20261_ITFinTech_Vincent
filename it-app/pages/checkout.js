import { useEffect, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import styles from "../styles/Checkout.module.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedTotal = localStorage.getItem("cartTotal");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedTotal) {
      setTotal(Number(savedTotal));
    }
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const confirmCheckout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          total: total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      console.log("Checkout created:", data);

      alert("Checkout berhasil!");

      localStorage.setItem("checkoutId", data.checkoutId);

      window.location.href = "/payment";
    } catch (error) {
      console.error(error);
      alert("Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`${styles.page} ${jakarta.className}`}>
      <header className={styles.topbar}>
        <div>
          <button
            className={styles.backButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <ArrowLeftIcon />
            <span>Back to Products</span>
          </button>

          <h1 className={styles.title}>Checkout</h1>

          <p className={styles.subtitle}>
            Review your order before completing your purchase.
          </p>
        </div>
      </header>

      {cart.length === 0 ? (
        <main className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <BagIcon />
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add some products before proceeding to checkout.
          </p>

          <button
            className={styles.primaryButton}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Products
          </button>
        </main>
      ) : (
        <main className={styles.layout}>
          <section className={styles.orderSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Your Order</h2>

                <p>
                  {totalItems} item{totalItems > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className={styles.orderCard}>
              {cart.map((item, index) => (
                <div
                  key={item.productId}
                  className={`${styles.orderItem} ${
                    index === cart.length - 1
                      ? styles.lastItem
                      : ""
                  }`}
                >
                  <div className={styles.productVisual}>
                    {item.image ? (
                        <img src={item.image} alt={item.name} />
                    ) : (
                        <span>
                        {item.name?.charAt(0)?.toUpperCase()}
                        </span>
                    )}
                    </div>

                  <div className={styles.productInfo}>
                    <h3>{item.name}</h3>

                    <span className={styles.quantity}>
                      {item.quantity} × {formatRupiah(item.price)}
                    </span>
                  </div>

                  <strong className={styles.subtotal}>
                    {formatRupiah(
                      item.price * item.quantity
                    )}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <aside className={styles.summaryCard}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRows}>
              <div>
                <span>Subtotal</span>

                <strong>
                  {formatRupiah(total)}
                </strong>
              </div>

              <div>
                <span>Shipping</span>

                <span className={styles.free}>
                  Free
                </span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>Total</span>

              <strong>
                {formatRupiah(total)}
              </strong>
            </div>

            <button
              className={styles.confirmButton}
              onClick={confirmCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Checkout
                  <ArrowRightIcon />
                </>
              )}
            </button>

            <p className={styles.secureText}>
              You&apos;ll proceed to payment after confirming
              your order.
            </p>
          </aside>
        </main>
      )}
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
