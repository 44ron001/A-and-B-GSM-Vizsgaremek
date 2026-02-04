function Header() {
	return(
    <header className='header'>
		<div className='header_container'>
			<div className='logo_container'>
				<img className='logo_image' src='./src/images/logo.png'/>
				<p className='logo_name'>A&B GSM</p>
			</div>
			<div className='filler'></div>
			<a className='header_link' href='https://www.google.com'>VIDEÓKÁRTYÁK</a>
			<a className='header_link' href='https://www.google.com'>PROCESSZOROK</a>
			<a className='header_link' href='https://www.google.com'>GÉPHÁZAK</a>
			<a className='header_link' href='https://www.google.com'>MONITOROK</a>
			<input type="search" className="search" placeholder="Search..." />
			<img className='user' src='./src/images/account.png'/>
		</div>
    </header>
  );
}
  
export default Header;