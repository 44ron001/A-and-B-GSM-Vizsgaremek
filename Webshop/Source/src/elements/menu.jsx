import { useNavigate } from 'react-router-dom';
function Menu({ selected }) {
	const navigate = useNavigate();
  return(
	<div className="landing_menu">
		<div className="menu_title">
			<p>CATEGORIES</p>
		</div>
		<div className={`category ${selected === "Videocards" ? "selected_nav" : ""}`} onClick={() => navigate('/videocards')}>
			<img className='category_image' src='/images/gpu.png'/>
			<p className='category_name'>VIDEOCARDS</p>
		</div>
		<div className={`category ${selected === "Processors" ? "selected_nav" : ""}`} onClick={() => navigate('/processors')}>
			<img className='category_image' src='/images/cpu.png'/>
			<p className='category_name'>PROCESSORS</p>
		</div>
		<div className={`category ${selected === "PC Cases" ? "selected_nav" : ""}`} onClick={() => navigate('/pc-cases')}>
			<img className='category_image' src='/images/pc.png'/>
			<p className='category_name'>PC CASES</p>
		</div>
		<div className={`category ${selected === "Monitors" ? "selected_nav" : ""}`} onClick={() => navigate('/monitors')}>
			<img className='category_image' src='/images/monitor.png'/>
			<p className='category_name'>MONITORS</p>
		</div>
		<div className={`category ${selected === "Motherboards" ? "selected_nav" : ""}`} onClick={() => navigate('/motherboards')}>
			<img className='category_image' src='/images/motherboard.png'/>
			<p className='category_name'>MOTHERBOARDS</p>
		</div>
		<div className={`category ${selected === "Power supply units" ? "selected_nav" : ""}`} onClick={() => navigate('/psu')}>
			<img className='category_image' src='/images/psu.png'/>
			<p className='category_name'>PSU</p>
		</div>
		<div className={`category ${selected === "Memories" ? "selected_nav" : ""}`} onClick={() => navigate('/ram')}>
			<img className='category_image' src='/images/memory.png'/>
			<p className='category_name'>RAM</p>
		</div>
		<div className={`category last_category ${selected === "Coolers" ? "selected_nav" : ""}`} onClick={() => navigate('/coolers')}>
			<img className='category_image' src='/images/cooler.png'/>
			<p className='category_name'>COOLER</p>
		</div>
	</div>
  );
}
export default Menu;