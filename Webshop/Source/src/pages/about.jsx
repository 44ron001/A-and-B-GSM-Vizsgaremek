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
		Promise.all(featuredPIDs.map(id => fetch(`http://localhost:3001/api/product/${id}`).then(res => res.json()))).then(results => { const valid = results.filter(r => r.success).map(r => r.data); setProducts(valid); });
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
				<Navs selected="about" />
				<Menu/>
			</div>
		<div className="cont">
			<div className="slideshow">
				<div className="slider">
					<div className="track" style={{ transform: `translateX(-${current * 100}%)` }} >
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
				  <h1 className="not">About This Project</h1>
				  <p>
					This webshop is a school project created as a <strong>final exam (vizsgaremek)</strong>. It is a non-profit
					demonstration system built for educational purposes only.
				  </p>
				  <h2>Project Purpose</h2>
				  <p>
					The goal of this project is to demonstrate full-stack development skills, including frontend design,
					backend API integration, database handling, and desktop application development.
				  </p>
				  <h2>Attributions</h2>
				  <div className="about_item">
					<h3>Mohacsek Áron</h3>
					<p>
					  Responsible for frontend development, UI/UX design, graphics, logo design,
					  API integration, and database connection.
					</p>
				  </div>
				  <div className="about_item">
					<h3>Uhrin Bence</h3>
					<p>
					  Developed the desktop application with full CRUD functionality, admin control system
					  for managing products and users, and contributed to backend API development.
					</p>
				  </div>
				  <h2>Tools & Resources</h2>
				  <p>
					Icons used in this project were provided by <strong>Flaticon</strong>.
				  </p>
				  <h2>School Information</h2>
				  <p>
					Logiker School<br />
					Szörény utca 2-4
				  </p>
				  <h2>Usage Policy</h2>
				  <p>
					This project may appear to be open-source in structure, however it is strictly not licensed for public use.
					It is intended only for educational evaluation by teachers as part of grading requirements.
				  </p>
				  <p>
					Any form of copying, modification, redistribution, reuse of code, design, images, or any other assets
					from this project is strictly prohibited.
				  </p>
				  <p>
					This includes, but is not limited to, frontend design, backend logic, database structure, UI elements,
					and all visual or functional components of the system.
				  </p>
				  <h2>Disclaimer</h2>
				  <p>
					This is a non-commercial educational project and is not intended for real-world business use.
					All data and functionality are for demonstration purposes only.
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