import { useNavigate } from "react-router-dom";

function Footer() {
	const navigate = useNavigate();
  return(
    <footer className='footer'>
      <div style={{ marginTop: '0', paddingTop: '0', textAlign: 'center', color: '#9ca3af' }}>
        <img onClick={() => navigate("/")} className='logo_image2' src='/images/logo.png' alt="logo" draggable="false"/>
		<p>&copy; 2026 A&B GSM - All Copyright reserved.</p>
      </div>
    </footer>
  );
}
  
export default Footer;