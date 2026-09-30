import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil products dari API
  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  // Menambah produk ke cart
  const addToCart = (product) => {
    const existingItem = cart.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
        productId: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1,
        }
      ]);
    }
  };

  // Mengurangi quantity
  const removeFromCart = (productId) => {
    const existingItem = cart.find(
      (item) => item.productId === productId
    );

    if (!existingItem) return;

    if (existingItem.quantity === 1) {
      setCart(cart.filter((item) => item.productId !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }
  };

  // Hitung total harga
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Select Items</h1>

      <p>Pilih produk yang ingin dibeli.</p>

      {/* PRODUCT LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {products.map((product) => {
          const cartItem = cart.find(
            (item) => item.productId === product._id
          );

          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <div
              key={product._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <h2>{product.name}</h2>

              <p>{product.description}</p>

              <p>
                <strong>{formatRupiah(product.price)}</strong>
              </p>

              <p>Category: {product.category}</p>

              <p>Stock: {product.stock}</p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => removeFromCart(product._id)}
                  disabled={quantity === 0}
                >
                  -
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() => addToCart(product)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CART */}
      <div
        style={{
          marginTop: "40px",
          borderTop: "2px solid #ddd",
          paddingTop: "20px",
        }}
      >
        <h2>Cart</h2>

        {cart.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.productId}>
                {item.name} × {item.quantity} ={" "}
                {formatRupiah(item.price * item.quantity)}
              </div>
            ))}

            <h3>Total: {formatRupiah(total)}</h3>

            <button
            onClick={() => {
                localStorage.setItem("cart", JSON.stringify(cart));
                localStorage.setItem("cartTotal", total.toString());

                window.location.href = "/checkout";
            }}
            >
            Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}