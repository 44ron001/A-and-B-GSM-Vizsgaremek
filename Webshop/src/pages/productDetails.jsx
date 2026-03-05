import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '/src/elements/header.jsx';
import Footer from '/src/elements/footer.jsx';

function ProductDetails({ fallbackImage }) {
	const { productID } = useParams();
	const navigate = useNavigate();

	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedImage, setSelectedImage] = useState(0);
	
	
const [token, setToken] = useState(null);
const [showLogin, setShowLogin] = useState(false);


useEffect(() => {
  const savedToken = sessionStorage.getItem("token");
  if (savedToken) setToken(savedToken);
}, []);

	useEffect(() => {
		fetchProduct();
	}, [productID]);


const addToCart = async () => {
  if (!token) {
    setShowLogin(true);
    return;
  }

  try {
    await fetch("http://localhost:3001/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        pID: product.pID,
        darab: 1
      })
    });

    alert("Termék hozzáadva a kosárhoz!");
  } catch (err) {
    alert("Hiba történt!");
  }
};


	const fetchProduct = async () => {
		try {
			setLoading(true);
			const response = await fetch(`http://localhost:3001/api/product/${productID}`);
			const data = await response.json();

			if (data.success) {
				setProduct(data.data);
			} else {
				setError(data.message);
			}
		} catch (err) {
			setError('Server error: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (price) => {
		return new Intl.NumberFormat('hu-HU').format(price) + ' Ft';
	};

	const getImageSrc = (imageData) => {
		if (imageData.startsWith('data:image')) return imageData;
		return `data:image/jpeg;base64,${imageData}`;
	};

	if (loading) return <div>Betöltés...</div>;
	if (error) return <div>Hiba: {error}</div>;
	if (!product) return null;

	return (
		<div className='container'>
			<Header forceLoginPopup={showLogin} />

			<div className='product-details'>
				<button onClick={() => navigate(-1)}>← Vissza</button>

				<div className='details-layout'>
					{/* IMAGES */}
					<div className='details-images'>
						<div className='main-image'>
							{product.images && product.images.length > 0 ? (
								<img
									src={getImageSrc(product.images[selectedImage].data)}
									alt={product.nev}
								/>
							) : (
								<img src={fallbackImage} alt={product.nev} />
							)}
						</div>

						{product.images && product.images.length > 1 && (
							<div className='thumbnails'>
								{product.images.map((img, index) => (
									<img
										key={img.id}
										src={getImageSrc(img.data)}
										alt="thumb"
										onClick={() => setSelectedImage(index)}
										className={selectedImage === index ? 'active' : ''}
									/>
								))}
							</div>
						)}
					</div>

					{/* INFO */}
					<div className='details-info'>
						<h1>{product.nev}</h1>

						<p className='full-description'>{product.leiras}</p>

						{product.attributes && (
							<div className='specs'>
								<h3>Specifikáció</h3>
								{Object.entries(product.attributes).map(([key, value]) => (
									<div key={key} className='spec-row'>
										<strong>{key}:</strong> {value}
									</div>
								))}
							</div>
						)}

						<div className='details-footer'>
							<div className='price'>
								{formatPrice(product.ar)}
							</div>

							<div className='stock'>
								{product.keszlet > 0
									? `Raktáron: ${product.keszlet} db`
									: 'Nincs raktáron'}
							</div>
						</div>

<button
  className='add-to-cart-btn'
  disabled={product.keszlet === 0}
  onClick={addToCart}
>
  {product.keszlet > 0 ? 'Kosárba' : 'Elfogyott'}
</button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}

export default ProductDetails;
