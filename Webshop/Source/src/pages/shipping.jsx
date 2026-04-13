import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import Header from '/src/elements/header.jsx'
import Footer from '/src/elements/footer.jsx'
import Menu from '/src/elements/menu.jsx'
import Navs from '/src/elements/navs.jsx'

function Content() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [products, setProducts] = useState([]);
	useEffect(() => {
	  const featuredPIDs = [3, 5];
	  Promise.all(
		featuredPIDs.map(id =>
		  fetch(`http://localhost:3001/api/product/${id}`)
			.then(res => res.json())
		)
	  ).then(results => {
		const valid = results
		  .filter(r => r.success)
		  .map(r => r.data);

		setProducts(valid);
	  });
	}, []);
	const getImageSrc = (imageData) => {
	  if (!imageData) return "";
	  if (imageData.startsWith("data:image")) return imageData;
	  return `data:image/jpeg;base64,${imageData}`;
	};
	const navigate = useNavigate();
	const intervalRef = useRef(null);
	const [current, setCurrent] = useState(0);
	const slides = [
	  { path:"videocards", img: "/images/slide1.jpg", text: "High-performance graphics cards" },
	  { path:"processors", img: "/images/slide2.jpg", text: "Next-gen processors for maximum speed" },
	  { path:"pc-cases", img: "/images/slide3.jpg", text: "Gaming PC cases with premium design" },
	  { path:"monitors", img: "/images/slide4.jpg", text: "Stunning high-resolution monitors" },
	  { path:"motherboards", img: "/images/slide5.jpg", text: "Reliable and powerful motherboards" },
	  { path:"psu", img: "/images/slide6.jpg", text: "Efficient and silent power supplies" },
	  { path:"ram", img: "/images/slide7.jpg", text: "Fast DDR memory modules" },
	  { path:"coolers", img: "/images/slide8.jpg", text: "Advanced cooling solutions" }
	];
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			setCurrent(prev => (prev + 1) % slides.length);
		}, 5000);

		return () => clearInterval(intervalRef.current);
	}, []);
	const nextSlide = () => {
		setCurrent(prev => (prev + 1) % slides.length);

		clearInterval(intervalRef.current);

		intervalRef.current = setInterval(() => {
			setCurrent(prev => (prev + 1) % slides.length);
		}, 5000);
	};
	const prevSlide = () => {
		setCurrent(prev => (prev - 1 + slides.length) % slides.length);
		clearInterval(intervalRef.current);

		intervalRef.current = setInterval(() => {
			setCurrent(prev => (prev + 1) % slides.length);
		}, 5000);
	};
	return(
	<div className='center'>
		<div className="slideshow_container">
			<div className="">
				<Navs selected="shipping" />
				<Menu/>
			</div>
		<div className="cont">
		<div className="slideshow">

			<div className="slider">
				<div
					className="track"
					style={{
						transform: `translateX(-${current * 100}%)`
					}}
				>
					{slides.map((slide, index) => (
						<div className="slide" key={index} onClick={() => navigate("/" + slide.path)}>
							<img src={slide.img} draggable="false" />
							<div className="slide_text">{slide.text}</div>
						</div>
					))}
				</div>
			</div>
			<div className="nav">
				<div className="side" onClick={prevSlide}>❮</div>
				<div className="side" onClick={nextSlide}>❯</div>
			</div>
			<div className="bullets">
				{slides.map((_, index) => (
					<div
						key={index}
						className={index === current ? "active" : ""}
						onClick={() => setCurrent(index)}
					/>
				))}
			</div>
			
		</div>
			<div className="landing_content">

			  <h1 className="not">Shipping Information</h1>

			  <p>
				We aim to deliver your orders quickly, safely, and reliably. Below you can find all important details about our shipping process,
				delivery times, and available options.
			  </p>

			  <h2>Delivery Options</h2>
			  <ul>
				<li>Standard Delivery (2–5 business days)</li>
				<li>Express Delivery (1–2 business days)</li>
				<li>Store Pickup (available in selected locations)</li>
			  </ul>

			  <h2>Processing Time</h2>
			  <p>
				Orders are typically processed within <strong>24 hours</strong> after payment confirmation.
				During busy periods or promotions, processing may take slightly longer.
			  </p>

			  <h2>Shipping Costs</h2>
			  <ul>
				<li>Orders under 50,000 Ft: calculated at checkout</li>
				<li>Orders over 50,000 Ft: free standard shipping</li>
				<li>Express shipping: additional fee applies</li>
			  </ul>

			  <h2>Delivery Areas</h2>
			  <p>
				We currently ship across Hungary and selected EU countries. Availability and delivery times may vary depending on your location.
			  </p>

			  <h2>Order Tracking</h2>
			  <p>
				Once your order has been shipped, you will receive a tracking number via email so you can follow your package in real time.
			  </p>

			  <h2>Important Notes</h2>
			  <ul>
				<li>Delivery times are estimates and may vary due to courier delays</li>
				<li>Make sure your shipping address is correct before placing an order</li>
				<li>We are not responsible for delays caused by external courier services</li>
			  </ul>

			  <p>
				If you have any questions about shipping, feel free to contact our support team — we’re here to help!
			  </p>

			</div>
		</div>
		</div>
		
	</div>
  );
}

function App() {
	return (
		<div className='container'>
			<Header/>
			<Content/>
			<div className='something'></div>
			<Footer/>
		</div>
	);
}

export default App;