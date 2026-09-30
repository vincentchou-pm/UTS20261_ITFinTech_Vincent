import { useEffect, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import styles from "../styles/Shop.module.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

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
    const existingItem = cart.find((item) => item.productId === product._id);

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
          image: product.image || "",
        },
      ]);
    }
  };

  // Mengurangi quantity
  const removeFromCart = (productId) => {
    const existingItem = cart.find((item) => item.productId === productId);
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

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Hitung total harga
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleCheckout = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartTotal", total.toString());
    window.location.href = "/checkout";
  };

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const visibleProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Dipanggil sebagai fungsi (bukan komponen) supaya tidak di-remount tiap render
  const renderCart = () => (
    <>
      <h2 className={styles.cartTitle}>Cart</h2>
      {cart.length === 0 ? (
        <p className={styles.muted}>
          Cart is empty. Tambahkan produk dengan tombol +.
        </p>
      ) : (
        <>
          <div className={styles.cartList}>
            {cart.map((item) => (
              <div key={item.productId} className={styles.cartRow}>
                <div className={styles.cartInfo}>
                  <span className={styles.cartName}>{item.name}</span>
                  <span className={styles.muted}>
                    {formatRupiah(item.price)} × {item.quantity}
                  </span>
                </div>
                <strong>{formatRupiah(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className={styles.cartTotal}>
            <span>Total</span>
            <strong>{formatRupiah(total)}</strong>
          </div>
          <button className={styles.checkoutBtn} onClick={handleCheckout}>
            Checkout
          </button>
        </>
      )}
    </>
  );

  return (
    <div className={`${styles.page} ${jakarta.className}`}>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.title}>Select Items</h1>
          <p className={styles.muted}>Pilih produk yang ingin dibeli.</p>
        </div>
        <button
          className={styles.cartChip}
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
        >
          <BagIcon />
          {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
        </button>
      </header>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </div>
      ) : (
        <div className={styles.layout}>
          <main>
            {/* CATEGORIES */}
            <section>
              <div className={styles.sectionHead}>
                <h2>Categories</h2>
              </div>
              <div className={styles.chips}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.chip} ${
                      activeCategory === cat ? styles.active : ""
                    }`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* PRODUCT LIST */}
            <section>
              <div className={styles.sectionHead}>
                <h2>{activeCategory === "All" ? "New arrivals" : activeCategory}</h2>
                <span className={`${styles.muted} ${styles.small}`}>
                  {visibleProducts.length} items
                </span>
              </div>

              {visibleProducts.length === 0 ? (
                <p className={styles.muted}>Belum ada produk di kategori ini.</p>
              ) : (
                <div className={styles.grid}>
                  {visibleProducts.map((product) => {
                    const cartItem = cart.find(
                      (item) => item.productId === product._id
                    );
                    const quantity = cartItem ? cartItem.quantity : 0;
                    const soldOut = product.stock === 0;
                    const lowStock = product.stock > 0 && product.stock <= 5;
                    const liked = wishlist.includes(product._id);

                    return (
                      <article key={product._id} className={styles.card}>
                        <div className={styles.media}>
                          {(soldOut || lowStock) && (
                            <span className={styles.badge}>
                              {soldOut ? "Sold out" : "Limited stock"}
                            </span>
                          )}

                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <span className={styles.placeholder}>
                              {product.name?.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className={styles.body}>
                          <span className={styles.brand}>{product.category}</span>
                          <h3 className={styles.name}>{product.name}</h3>
                          {product.description && (
                            <p className={styles.desc}>{product.description}</p>
                          )}
                          <span className={styles.stock}>Stock: {product.stock}</span>

                          <div className={styles.buy}>
                            <span className={styles.price}>
                              {formatRupiah(product.price)}
                            </span>

                            {/* Satu elemen yang berubah bentuk: + bulat -> − 1 + */}
                            <div
                              className={`${styles.action} ${
                                quantity > 0 ? styles.open : ""
                              }`}
                            >
                              <button
                                className={styles.minus}
                                onClick={() => removeFromCart(product._id)}
                                disabled={quantity === 0}
                                tabIndex={quantity === 0 ? -1 : 0}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className={styles.count} aria-live="polite">
                                {quantity}
                              </span>
                              <button
                                className={styles.plus}
                                onClick={() => addToCart(product)}
                                disabled={soldOut || quantity >= product.stock}
                                title={
                                  soldOut
                                    ? "Stok habis"
                                    : quantity >= product.stock
                                    ? "Sudah mencapai stok maksimal"
                                    : ""
                                }
                                aria-label={`Add ${product.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </main>

          {/* CART (desktop sidebar) */}
          <aside className={styles.cartSide}>{renderCart()}</aside>
        </div>
      )}

      {/* CART (mobile bottom bar + sheet) */}
      {totalItems > 0 && !cartOpen && (
        <button className={styles.mobileBar} onClick={() => setCartOpen(true)}>
          <span>
            {totalItems} item{totalItems > 1 ? "s" : ""}
          </span>
          <strong>{formatRupiah(total)}</strong>
        </button>
      )}

      {cartOpen && (
        <div className={styles.sheetBackdrop} onClick={() => setCartOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.sheetClose}
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
            >
              ×
            </button>
            {renderCart()}
          </div>
        </div>
      )}
    </div>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}