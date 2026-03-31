import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "/src/elements/header.jsx";
import Footer from "/src/elements/footer.jsx";

function Cart() {
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [form, setForm] = useState({
    szallitasiCim: "",
    fizetesiMod: "",
    saveAddress: false,
  });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchCart(savedToken);
    }
  }, []);

  const fetchCart = async (jwt) => {
    const res = await fetch("http://localhost:3001/api/cart", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await res.json();
    if (data.success) setCart(data.data);
  };

  const fetchPaymentMethods = async (jwt) => {
    const res = await fetch("http://localhost:3001/api/payments", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await res.json();
    if (data.success) {
      setPaymentMethods(data.data);
      if (data.data.length > 0) {
        setForm((f) => ({ ...f, fizetesiMod: data.data[0].mivel }));
      }
    }
  };

  const fetchProfileAddress = async (jwt) => {
    const res = await fetch("http://localhost:3001/api/profile", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await res.json();
    if (data.success && data.data.lakcim) {
      setForm((f) => ({ ...f, szallitasiCim: data.data.lakcim }));
    }
  };

  const openCheckout = async () => {
    setError("");
    setOrderSuccess(null);
    await fetchPaymentMethods(token);
    await fetchProfileAddress(token);
    setShowCheckout(true);
  };

  const updateQuantity = async (pID, darab) => {
    if (darab < 1) return;
    await fetch("http://localhost:3001/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pID, darab }),
    });
    fetchCart(token);
  };

  const getImageSrc = (imageData) => {
    if (!imageData) return "";
    if (imageData.startsWith("data:image")) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const deleteItem = async (pID) => {
    await fetch(`http://localhost:3001/api/cart/${pID}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart(token);
  };

  const handleCheckout = async () => {
    if (!form.szallitasiCim.trim()) {
      setError("Kérjük add meg a szállítási címet!");
      return;
    }
    if (!form.fizetesiMod) {
      setError("Kérjük válassz fizetési módot!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          szallitasiCim: form.szallitasiCim,
          fizetesiMod: form.fizetesiMod,
          saveAddress: form.saveAddress,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrderSuccess(data.orderID);
        setCart([]);
      } else {
        setError(data.message || "Hiba történt a rendelés leadásakor.");
      }
    } catch (e) {
      setError("Szerverhiba. Kérjük próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.ar * item.darab, 0);

  return (
    <div className="container">
      <Header />
      <div className="cart_container">
        <div className="cart_content">
          <h1>Kosár</h1>
          {cart.length === 0 && !orderSuccess ? (
            <p>A kosár üres.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.pID} className="cart-item">
                  {item.images?.[0] && (
                    <img
                      onClick={() => navigate(`/product/${item.pID}`)}
                      className="cartImage"
                      src={getImageSrc(item.images[0].data)}
                      alt={item.nev}
                    />
                  )}
                  <a onClick={() => navigate(`/product/${item.pID}`)}>
                    {item.nev}
                  </a>
                  <div className="filler"></div>
                  <p>{item.ar} Ft</p>
                  <input
                    className="cart_quantity"
                    type="number"
                    value={item.darab}
                    min="1"
                    onChange={(e) =>
                      updateQuantity(item.pID, Number(e.target.value))
                    }
                  />
                  <button onClick={() => deleteItem(item.pID)}>Törlés</button>
                </div>
              ))}
              <h2>Összesen: {total.toLocaleString("hu-HU")} Ft</h2>
              <button onClick={openCheckout}>Rendelés leadása</button>
            </>
          )}
        </div>
      </div>

      {/* ─── CHECKOUT POPUP ─── */}
      {showCheckout && (
        <div
          className="checkout-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCheckout(false);
          }}
        >
          <div className="checkout-modal">
            {orderSuccess ? (
              <div className="checkout-success">
                <h2>✅ Rendelés sikeresen leadva!</h2>
                <p>Rendelésazonosító: <strong>#{orderSuccess}</strong></p>
                <p>Hamarosan felvesszük veled a kapcsolatot.</p>
                <button onClick={() => { setShowCheckout(false); navigate("/"); }}>
                  Vissza a főoldalra
                </button>
              </div>
            ) : (
              <>
                <div className="checkout-header">
                  <h2>Rendelés leadása</h2>
                  <button
                    className="checkout-close"
                    onClick={() => setShowCheckout(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="checkout-summary">
                  {cart.map((item) => (
                    <div key={item.pID} className="checkout-summary-item">
                      <span>{item.nev} × {item.darab}</span>
                      <span>{(item.ar * item.darab).toLocaleString("hu-HU")} Ft</span>
                    </div>
                  ))}
                  <div className="checkout-summary-total">
                    <strong>Összesen:</strong>
                    <strong>{total.toLocaleString("hu-HU")} Ft</strong>
                  </div>
                </div>

                <div className="checkout-form">
                  <label>Szállítási cím</label>
                  <input
                    type="text"
                    placeholder="Irányítószám, város, utca, házszám"
                    value={form.szallitasiCim}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, szallitasiCim: e.target.value }))
                    }
                  />

                  <div className="checkout-save-address">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={form.saveAddress}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, saveAddress: e.target.checked }))
                      }
                    />
                    <label htmlFor="saveAddress">
                      Cím mentése következő vásárláshoz
                    </label>
                  </div>

                  <label>Fizetési mód</label>
                  <div className="checkout-payment-options">
                    {paymentMethods.map((pm) => (
                      <label key={pm.fizID} className="checkout-payment-option">
                        <input
                          type="radio"
                          name="fizetesiMod"
                          value={pm.mivel}
                          checked={form.fizetesiMod === pm.mivel}
                          onChange={() =>
                            setForm((f) => ({ ...f, fizetesiMod: pm.mivel }))
                          }
                        />
                        {pm.mivel}
                      </label>
                    ))}
                  </div>

                  {error && <p className="checkout-error">{error}</p>}

                  <button
                    className="checkout-submit"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? "Feldolgozás..." : "Rendelés véglegesítése"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Cart;