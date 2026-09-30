import { useEffect, useState } from "react";

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

      // Simpan checkout ID untuk halaman payment nanti
      localStorage.setItem("checkoutId", data.checkoutId);

      window.location.href = "/payment";
    } catch (error) {
      console.error(error);
      alert("Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Checkout</h1>

      <p>Review pesanan kamu sebelum melakukan pembayaran.</p>

      {cart.length === 0 ? (
        <div>
          <p>Cart kamu kosong.</p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Products
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: "30px" }}>
            {cart.map((item) => (
              <div
                key={item.productId}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              >
                <h3>{item.name}</h3>

                <p>
                  {item.quantity} × {formatRupiah(item.price)}
                </p>

                <strong>
                  Subtotal:{" "}
                  {formatRupiah(item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "30px",
              borderTop: "2px solid #ddd",
              paddingTop: "20px",
            }}
          >
            <h2>Total: {formatRupiah(total)}</h2>

            <button
              onClick={confirmCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}