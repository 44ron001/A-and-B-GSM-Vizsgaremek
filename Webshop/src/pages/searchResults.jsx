import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from '/src/elements/header.jsx';
import Footer from '/src/elements/footer.jsx';

function SearchResults() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

const getImageSrc = (imageData) => {
  if (!imageData) return "";
  if (imageData.startsWith("data:image")) return imageData;
  return `data:image/jpeg;base64,${imageData}`;
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
  
    <div className="search_page">
	<Header/>
      <h2>Search Results for "{name}"</h2>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="search_grid">
          {products.map((product) => (
            <div
              key={product.pID}
              className="search_card"
              onClick={() => navigate(`/product/${product.pID}`)}
            >
{product.images?.[0] && (
  <img
    src={getImageSrc(product.images[0].data)}
    alt={product.nev}
  />
)}

              <h3>{product.nev}</h3>
              <p>{product.ar} Ft</p>
            </div>
          ))}
        </div>
      )}
	  <Footer/>
    </div>
	
  );
}

export default SearchResults;