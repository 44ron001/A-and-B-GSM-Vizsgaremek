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

	// 👉 AUTO SLIDE (every 5 sec)
useEffect(() => {
	intervalRef.current = setInterval(() => {
		setCurrent(prev => (prev + 1) % slides.length);
	}, 5000);

	return () => clearInterval(intervalRef.current);
}, []);

	// 👉 MANUAL NAV
const nextSlide = () => {
	setCurrent(prev => (prev + 1) % slides.length);

	clearInterval(intervalRef.current);

	intervalRef.current = setInterval(() => {
		setCurrent(prev => (prev + 1) % slides.length);
	}, 5000);
};

const prevSlide = () => {
	setCurrent(prev => (prev - 1 + slides.length) % slides.length);

	// reset timer
	clearInterval(intervalRef.current);

	intervalRef.current = setInterval(() => {
		setCurrent(prev => (prev + 1) % slides.length);
	}, 5000);
};

	
	
	return(
	<div className='center'>
	
		<div className="slideshow_container">
			<div className="">
				<Navs selected="contact" />
				<Menu/>
			</div>

		<div className="cont">
		<div className="slideshow">
			
			{/* IMAGE */}
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

			

			{/* NAV */}
			<div className="nav">
				<div className="side" onClick={prevSlide}>❮</div>
				<div className="side" onClick={nextSlide}>❯</div>
			</div>

			{/* BULLETS */}
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

  <h1 className="not">Contact Us</h1>

  <p>
    If you have any questions about our products, orders, or services, feel free to reach out to us.
    Our team is here to help you as quickly as possible.
  </p>

  <h2>Email</h2>
  <p>
    <strong>info@abgsm.hu</strong>
  </p>

  <h2>Address</h2>
  <p>
    Budapest, Szörény utca 2-4
  </p>

  <h2>Customer Support</h2>
  <p>
    We usually respond to emails within 24 hours on business days.
  </p>

  <h2>Frequently Asked Questions</h2>

  <div className="faq_item">
    <h3>How long does delivery take?</h3>
    <p>
      Delivery usually takes 2–5 business days depending on your location and selected shipping method.
    </p>
  </div>

  <div className="faq_item">
    <h3>Can I track my order?</h3>
    <p>
      Yes, once your order is shipped, you will receive a tracking number via email.
    </p>
  </div>

  <div className="faq_item">
    <h3>Do you offer warranty?</h3>
    <p>
      Yes, all products come with manufacturer warranty. Warranty length depends on the product category.
    </p>
  </div>

  <div className="faq_item">
    <h3>What payment methods are accepted?</h3>
    <p>
      We accept card payments and other supported online payment methods at checkout.
    </p>
  </div>

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