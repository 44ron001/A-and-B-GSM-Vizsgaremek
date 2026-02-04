import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/src/elements/header.jsx';
import Footer from '/src/elements/footer.jsx';

function Products({ categoryId, categoryName, fallbackImage }) {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedImages, setSelectedImages] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		fetchProducts();
	}, [categoryId]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await fetch(`http://localhost:3001/api/products/${categoryId}`);
			const data = await response.json();
			if (data.success) {
				setProducts(data.data);
				const initialSelected = {};
				data.data.forEach(product => {
					initialSelected[product.pID] = 0;
				});
				setSelectedImages(initialSelected);
			} else {
				setError(data.message || 'Failed to fetch products');
			}
		} catch (err) {
			setError('Error connecting to server: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (price) => {
		return new Intl.NumberFormat('hu-HU').format(price) + ' Ft';
	};

	const handleImageSelect = (productId, imageIndex) => {
		setSelectedImages(prev => ({
			...prev,
			[productId]: imageIndex
		}));
	};

	const getImageSrc = (imageData) => {
		if (imageData.startsWith('data:image')) {
			return imageData;
		}
		return `data:image/jpeg;base64,${imageData}`;
	};

	if (loading) {
		return (
			<div className='container'>
				<Header />
				<div className='center'>
					<div className='loading'>Betöltés...</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (error) {
		return (
			<div className='container'>
				<Header />
				<div className='center'>
					<div className='error'>Hiba: {error}</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className='container'>
			<Header />
			<div className='center'>
				<div className='content'>
					<h1 className='page-title'>{categoryName}</h1>
					<div className='products-grid'>
						{products.length === 0 ? (
							<p>Nincs elérhető termék ebben a kategóriában.</p>
						) : (
							products.map(product => (
								<div key={product.pID} className='product-card'>
									<div className='product-image-container'>
										<div className='product-image'>
											{product.images && product.images.length > 0 ? (
												<img 
													src={getImageSrc(product.images[selectedImages[product.pID] || 0].data)} 
													alt={product.nev} 
												/>
											) : (
												<img src={fallbackImage} alt={product.nev} />
											)}
										</div>
										{product.images && product.images.length > 1 && (
											<div className='image-thumbnails'>
												{product.images.map((image, index) => (
													<div
														key={image.id}
														className={`thumbnail ${selectedImages[product.pID] === index ? 'active' : ''}`}
														onClick={() => handleImageSelect(product.pID, index)}
													>
														<img 
															src={getImageSrc(image.data)} 
															alt={`${product.nev} - ${index + 1}`} 
														/>
													</div>
												))}
											</div>
										)}
									</div>
									
									<div className='product-info'>
										<h3 className='product-name'>{product.nev}</h3>
										<p className='product-description'>{product.leiras}</p>
										
										{product.attributes && Object.keys(product.attributes).length > 0 && (
											<div className='product-specs'>
												{Object.entries(product.attributes).map(([key, value]) => (
													<div key={key} className='spec-item'>
														<span className='spec-label'>{key}:</span>
														<span className='spec-value'>{value}</span>
													</div>
												))}
											</div>
										)}
										
										<div className='product-footer'>
											<div className='product-stock'>
												{product.keszlet > 0 ? (
													<span className='in-stock'>Raktáron: {product.keszlet} db</span>
												) : (
													<span className='out-of-stock'>Nincs raktáron</span>
												)}
											</div>
											<div className='product-price'>{formatPrice(product.ar)}</div>
										</div>
										
										<button 
											className='add-to-cart-btn'
											disabled={product.keszlet === 0}
										>
											{product.keszlet > 0 ? 'Kosárba' : 'Elfogyott'}
										</button>
									</div>
								</div>
							))
						)}
					</div>
					<button className='back-btn' onClick={() => navigate('/')}>
						Vissza a főoldalra
					</button>
				</div>
			</div>
			<Footer />
		</div>
	);
}

export default Products;
