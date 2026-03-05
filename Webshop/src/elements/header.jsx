import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Header({ forceLoginPopup }) {
const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState("");
	
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isClosingAuth, setIsClosingAuth] = useState(false);
  const [isClosingProfile, setIsClosingProfile] = useState(false);
  
  const [token, setToken] = useState(null);
  const [form, setForm] = useState({
    nev: "",
    email: "",
    password: "",
    telefon: "",
    lakcim: ""
  });
  
  
useEffect(() => {
  if (forceLoginPopup) {
    resetForm();
    setShowAuth(true);
  }
}, [forceLoginPopup]);
  
  

  // On mount, check if user is logged in
useEffect(() => {
  const savedToken = sessionStorage.getItem("token");
  if (savedToken) setToken(savedToken);
  const loggedIn = sessionStorage.getItem("loggedIn");
  if (loggedIn) setUser(true); // optionally fetch profile immediately
}, []);

  // Login handler
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        email: form.email,
        password: form.password
      });

if (res.data.success) {
  sessionStorage.setItem("token", res.data.token); // store token temporarily
  setToken(res.data.token);
  setUser(res.data.user);
  sessionStorage.setItem("loggedIn", "true"); // keep login state
  closeAuthPopup();
}
    } catch {
      alert("Invalid credentials");
    }
  };

  // Register handler
  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:3001/api/register", form);
      alert("Registration successful!");
      setIsLogin(true);
    } catch {
      alert("Registration failed");
    }
  };

  // Logout handler
const logout = () => {
  closeProfilePopup();
  setUser(null);
  setToken(null);

  sessionStorage.removeItem("loggedIn");
  sessionStorage.removeItem("token");
};

const resetForm = () => {
  setForm({
    nev: "",
    email: "",
    password: "",
    telefon: "",
    lakcim: ""
  });
};


  const openProfilePopup = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const data = res.data.data;
        setUser(data);
        setForm({
          nev: data.nev || "",
          email: data.email || "",
          password: "",
          telefon: data.telefon || "",
          lakcim: data.lakcim || ""
        });
        setShowProfile(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch profile");
    }
  };

  // Update profile handler
  const updateProfile = async () => {
    try {
      const updateData = { ...form };
      if (!form.password) delete updateData.password; 

      const res = await axios.put(
        "http://localhost:3001/api/profile",
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setUser(res.data.user); 
        alert("Profile updated successfully!");
        closeProfilePopup();
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update profile");
    }
  };


const closeAuthPopup = () => {
  setIsClosingAuth(true);
  setTimeout(() => {
    setShowAuth(false);
    setIsClosingAuth(false);
    setIsLogin(true);
    resetForm();
  }, 300);
};

  const closeProfilePopup = () => {
    setIsClosingProfile(true);
    setTimeout(() => {
      setShowProfile(false);
      setIsClosingProfile(false);
    }, 300);
  };

  return (
    <>
      {/* HEADER */}
      <header className='header'>
        <div className='header_container'>
          <div className='logo_container'>
            <img className='logo_image' src='/images/logo.png' alt="logo" />
            <p className='logo_name'>A&B GSM</p>
          </div>

          <div className='filler'></div>

          <div className='searchContainer'>
<input
  type="search"
  className="search"
  placeholder="Search..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && searchTerm.trim().length > 1) {
      navigate(`/search/${searchTerm}`);
    }
  }}
/>
            <div className='searchHolder'>
<img
  className='searchIcon'
  src='/images/search.png'
  alt="search"
  onClick={() => {
    if (searchTerm.trim().length > 1) {
      navigate(`/search/${searchTerm}`);
    }
  }}
/>
            </div>
          </div>

          {user ? (
            <>
             <img
  className='cart'
  src='/images/cart.png'
  alt="cart"
  onClick={() => navigate("/cart")}
/>
              <img
                className='user'
                src='/images/account.png'
                alt="profile"
                onClick={openProfilePopup}
              />
            </>
          ) : (
            <button className='belepes' onClick={() => { resetForm();setShowAuth(true); }}>
              Log in
            </button>
          )}
        </div>
      </header>

      {/* LOGIN / REGISTER POPUP */}
      {showAuth && (
        <div className={`popup_container ${isClosingAuth ? "fade-out" : ""}`} onClick={closeAuthPopup}>
          <div className={`popup ${isClosingAuth ? "fade-out" : ""}`} onClick={e => e.stopPropagation()}>
            <div className="popup_header">
              <h2>{isLogin ? "Login" : "Sign Up"}</h2>
              <div className='filler'></div>
              <img src='/images/close.png' className="closeButton" onClick={closeAuthPopup} />
            </div>

            {!isLogin && (
              <input
                placeholder="Name"
                value={form.nev}
                onChange={e => setForm({ ...form, nev: e.target.value })}
              />
            )}

            <input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <div className='loginContainer'>
              <button onClick={isLogin ? handleLogin : handleRegister}>
                {isLogin ? "Login" : "Register"}
              </button>
            </div>

            <p className='infoLogin' style={{ cursor: "pointer" }} onClick={() => { resetForm(); setIsLogin(!isLogin); }}>
              {isLogin ? "No account? Register" : "Already have account? Login"}
            </p>
          </div>
        </div>
      )}

      {/* PROFILE POPUP */}
      {showProfile && user && (
        <div className={`popup_container ${isClosingProfile ? "fade-out" : ""}`} onClick={closeProfilePopup}>
          <div className={`popup ${isClosingProfile ? "fade-out" : ""}`} onClick={e => e.stopPropagation()}>
            <div className="popup_header">
              <h2>Profile</h2>
              <div className='filler'></div>
              <img src='/images/close.png' className="closeButton" onClick={closeProfilePopup} />
            </div>

            <p>Status: Logged in as <strong>{user.nev}</strong></p>

            <div className="popup_content">
              <label>
                Name:
                <input value={form.nev} onChange={e => setForm({ ...form, nev: e.target.value })}/>
              </label>

              <label>
                Email:
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
              </label>

              <label>
                Password:
                <input type="password" placeholder="Enter new password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
              </label>

              <label>
                Phone:
                <input value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })}/>
              </label>

              <label>
                Address (Lakcím):
                <input className='utso' value={form.lakcim} onChange={e => setForm({ ...form, lakcim: e.target.value })}/>
              </label>
            </div>

            <div className="profile_buttons">
              <button onClick={updateProfile}>Save Changes</button>
			  <div className='filler'></div>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;