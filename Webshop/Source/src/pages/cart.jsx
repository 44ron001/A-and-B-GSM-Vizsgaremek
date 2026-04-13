import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "/src/elements/header.jsx";
import Footer from "/src/elements/footer.jsx";
import Menu from '/src/elements/menu.jsx';
import Navs from '/src/elements/navs.jsx';

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
		const res = await fetch("http://localhost:3001/api/cart", { headers: { Authorization: `Bearer ${jwt}` }, });
		const data = await res.json();
		if (data.success) setCart(data.data);
	};
	const fetchPaymentMethods = async (jwt) => {
		const res = await fetch("http://localhost:3001/api/payments", { headers: { Authorization: `Bearer ${jwt}` }, });
		const data = await res.json();
		if (data.success) {
			setPaymentMethods(data.data);
			if (data.data.length > 0) {
				setForm((f) => ({ ...f, fizetesiMod: data.data[0].mivel }));
			}
		}
	};
	const fetchProfileAddress = async (jwt) => {
		const res = await fetch("http://localhost:3001/api/profile", { headers: { Authorization: `Bearer ${jwt}` }, });
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
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
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
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
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
      <div className="center">
        <div className="slideshow_container">
		<div><Navs/><Menu selected="" /></div>
			<div className="right_content">
				<div className="title_container">
					<img className='back_btn' src='/images/undo.png' alt="back" draggable="false" onClick={() => navigate(-1)}/>
					<h1 className='page_title'>Cart</h1>
				</div>
			<div className="cart_content">
          {cart.length === 0 && !orderSuccess ? (
            <p className="empty">Your cart is empty.</p>
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
                  <button onClick={() => deleteItem(item.pID)}>Remove</button>
                </div>
              ))}
              <h2>Total: {total.toLocaleString("hu-HU")} Ft</h2>
              <button className='order_button' onClick={openCheckout}>Checkout</button>
            </>
          )}
        </div>
      </div>
      </div>
      {showCheckout && (
        <div className="checkout-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCheckout(false); }} >
          <div className="checkout-modal">
            {orderSuccess ? (
              <div className="checkout-success">
                <h2 className="aaa">Order submitted successfully!</h2>
                <p>Order Number: <strong>#{orderSuccess}</strong></p>
                <p>We will be in touch with you shortly.</p>
                <button className='order_button' onClick={() => { setShowCheckout(false); navigate("/"); }}> Go back to main page</button>
              </div>
            ) : (
              <>
                <div className="checkout-header">
                  <h2>Submit order</h2>
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
                    <strong>Total:</strong>
                    <strong>{total.toLocaleString("hu-HU")} Ft</strong>
                  </div>
                </div>

                <div className="checkout-form">
                  <label>Delivery address</label>
                  <input
                    type="text"
                    placeholder="ZIP Code, City, Street, House number"
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
                    <label htmlFor="saveAddress">Save address for future purchases</label>
                  </div>
                  <label>Payment method</label>
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
                  <button className="add-to-cart-btn" onClick={handleCheckout} disabled={loading}>
                    {loading ? "Processing..." : "Submit order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
	</div>
  <Footer />
    </div>
  );
}

export default Cart;