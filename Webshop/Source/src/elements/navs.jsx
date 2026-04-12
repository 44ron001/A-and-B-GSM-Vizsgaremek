import { useNavigate } from 'react-router-dom';
function Navs({ selected }) {
	const navigate = useNavigate();
	return(
		<div className="landing_menu">
			<div className="menu_title">
				<p>PAGES</p>
			</div>
			<div className={`category ${selected === "home" ? "selected_nav" : ""}`} onClick={() => navigate('/')}>
				<p className="category_name">HOME</p>
			</div>
			<div className={`category ${selected === "shipping" ? "selected_nav" : ""}`} onClick={() => navigate('/shipping')}>
				<p className='category_name'>SHIPPING</p>
			</div>
			<div className={`category ${selected === "contact" ? "selected_nav" : ""}`} onClick={() => navigate('/contact')}>
				<p className='category_name'>CONTACT</p>
			</div>
			<div className={`category last_category ${selected === "about" ? "selected_nav" : ""}`} onClick={() => navigate('/about')}>
				<p className='category_name'>ABOUT</p>
			</div>
		</div>
	);
}
export default Navs;