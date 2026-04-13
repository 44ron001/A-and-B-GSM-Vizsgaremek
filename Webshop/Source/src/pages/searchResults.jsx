import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from '/src/elements/header.jsx';
import Footer from '/src/elements/footer.jsx';
import Menu from '/src/elements/menu.jsx';
import Navs from '/src/elements/navs.jsx';

function SearchResults() {
	const { name } = useParams();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const getImageSrc = (imageData) => {
	  if (!imageData) return "";
	  if (imageData.startsWith("data:image")) return imageData;
	  return `data:image/jpeg;base64,${imageData}`;
	};
	const formatPrice = (price) => {
		return new Intl.NumberFormat('hu-HU').format(price) + ' Ft';
	};
	useEffect(() => {
	axios
	  .get(`http://localhost:3001/api/search/${name}`)
	  .then((res) => {
		if (res.data.success) {
		  setProducts(res.data.data);
		}
	  })
	  .catch(() => console.error("Search failed"));
	}, [name]);
  return (
    <div className="container">
	<Header/>
	<div className="center">
		<div className="slideshow_container">
			<div><Navs/><Menu selected="" /></div>
			<div className="right_content">
				<div className="title_container">
					<img className='back_btn' src='/images/undo.png' alt="back" draggable="false" onClick={() => navigate(-1)}/>
					<h1 className='page_title'>Search Results for: {name}</h1>
				</div>
			  {products.length === 0 ? (
				<p>No products found.</p>
			  ) : (
				<div className="products-grid">
				  {products.map((product) => (
					<div key={product.pID} className="product-card" onClick={() => navigate(`/product/${product.pID}`)} >
					{product.images?.[0] && ( <img src={getImageSrc(product.images[0].data)} alt={product.nev} />)}
						<div className='product-info'>
					  <h3 className='product-name'>{product.nev}</h3>
					  <p className='product-description short'> {product.leiras.length > 60 ? product.leiras.substring(0, 60) + '...' : product.leiras} </p>
						<div className='product-footer'>
							<div className='product-stock'> {product.keszlet > 0 ? ( <span className='in-stock'>In Stock</span> ) : ( <span className='out-of-stock'>Nincs raktáron</span> )} </div>
							<div className='product-price'> {formatPrice(product.ar)} </div>
						</div>
					  </div>
					</div>
				  ))}
				</div>
			  )}
			  </div>
		  </div>
	  </div>
	  <Footer/>
    </div>
	
  );
}

export default SearchResults;