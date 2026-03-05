import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "/src/elements/header.jsx";
import Footer from "/src/elements/footer.jsx";

function Cart() {
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(null);
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
      headers: { Authorization: `Bearer ${jwt}` }
    });

    const data = await res.json();
    if (data.success) setCart(data.data);
  };

  const updateQuantity = async (pID, darab) => {
    if (darab < 1) return;

    await fetch("http://localhost:3001/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pID, darab })
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
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchCart(token);
  };

  const total = cart.reduce((sum, item) => sum + item.ar * item.darab, 0);

  return (
    <div className="container">
      <Header />

      <div className="cart_container">
      <div className="cart_content">
        <h1>Kosár</h1>

        {cart.length === 0 ? (
          <p>A kosár üres.</p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.pID} className="cart-item">
				{item.images?.[0] && (<img onClick={() => navigate(`/product/${item.pID}`)} className="cartImage" src={getImageSrc(item.images[0].data)} alt={item.nev} />)}
                <a onClick={() => navigate(`/product/${item.pID}`)}>{item.nev}</a>
                <div className="filler"></div>
				
				<p>{item.ar} Ft</p>
				
				
				
                <input className="cart_quantity" type="number" value={item.darab} min="1" onChange={(e) => updateQuantity(item.pID, Number(e.target.value))} />

                <button onClick={() => deleteItem(item.pID)}>
                  Törlés
                </button>
              </div>
            ))}

            <h2>Összesen: {total} Ft</h2>

            <button disabled>Rendelés (hamarosan)</button>
          </>
        )}
      </div>
      </div>

      <Footer />
    </div>
  );
}

export default Cart;