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
				<Navs selected="home" />
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
			  {products[0]?.images?.length > 0 && (
				<div onClick={() => navigate("/product/3")} className="landing_hero_image">
				  <img src={getImageSrc(products[0].images[0].data)} alt={products[0].nev}
				  />
				</div>
			  )}
			  <h1 onClick={() => navigate("/product/3")}>ASUS Dual GeForce RTX 5060</h1>

			  <p>
				The <strong>ASUS Dual GeForce RTX 5060 8GB GDDR7 OC Edition</strong> is a next-generation graphics card designed for
				smooth performance, efficient cooling, and reliable everyday gaming and creative workloads. It delivers modern GPU
				power in a compact dual-fan design.
			  </p>

			  <h2>Who is it for?</h2>
			  <p>
				This GPU is perfect for <strong>gamers, content creators, and everyday PC enthusiasts</strong> who want strong performance
				without moving into extreme workstation pricing. It balances power efficiency, speed, and affordability.
			  </p>

			  <h2>What can you use it for?</h2>
			  <ul>
				<li>Modern AAA gaming at high settings</li>
				<li>1080p and 1440p high-refresh gameplay</li>
				<li>Video editing and content creation</li>
				<li>Light AI and GPU-accelerated tasks</li>
				<li>Streaming and multitasking setups</li>
			  </ul>

			  <h2>Key Highlights</h2>
			  <ul>
				<li>8GB next-gen GDDR7 memory</li>
				<li>Factory OC with 2535 MHz clock speed</li>
				<li>Dual-fan cooling system for stable thermals</li>
				<li>8K resolution support (7680×4320)</li>
				<li>Optimized for efficiency and quiet operation</li>
			  </ul>

			  <p>
				A solid, modern GPU choice for users who want great performance, efficiency, and ASUS reliability in a compact design.
			  </p>

			  <button onClick={() => navigate("/product/3")} className="buy_link order_button">
				View Product & Buy
			  </button>
			</div>	
			<div className="landing_content">
			  {products[1]?.images?.length > 0 && (
				<div onClick={() => navigate("/product/5")} className="landing_hero_image">
				  <img
					src={getImageSrc(products[1].images[0].data)}
					alt={products[1].nev}
				  />
				</div>
			  )}

			  <h1 onClick={() => navigate("/product/5")}>{products[1]?.nev}</h1>
			  <p>
				The <strong>PNY NVIDIA RTX PRO 6000 Blackwell Workstation Edition</strong> is a next-generation professional GPU designed for
				extreme performance and demanding workloads. Built for creators, engineers, and AI professionals, this graphics card delivers
				unmatched power for modern computing tasks.
			  </p>

			  <h2>Who is it for?</h2>
			  <p>
				This GPU is ideal for professionals working in <strong>3D rendering, AI development, machine learning, simulation,
				scientific computing, and high-end video production</strong>. It is not just a gaming card – it is engineered for
				enterprise-level performance and reliability.
			  </p>

			  <h2>What can you use it for?</h2>
			  <ul>
				<li>Advanced AI model training and inference</li>
				<li>Complex 3D rendering and animation</li>
				<li>Engineering simulations and CAD workloads</li>
				<li>8K video editing and post-production</li>
				<li>Data science and GPU-accelerated computing</li>
			  </ul>

			  <h2>Key Highlights</h2>
			  <ul>
				<li>96 GB GDDR7 VRAM for massive workloads</li>
				<li>Next-gen Blackwell architecture performance</li>
				<li>8K resolution support (7680×4320)</li>
				<li>Professional-grade stability and optimization</li>
			  </ul>

			  <p>
				A recently arrived powerhouse GPU for professionals who demand the absolute best performance available on the market today.
			  </p>

			  <button className="order_button buy_link" onClick={() => navigate("/product/5")}>
				View Product & Buy
			  </button>
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