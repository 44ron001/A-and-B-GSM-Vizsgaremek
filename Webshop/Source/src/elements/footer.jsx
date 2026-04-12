function Footer() {
  return(
    <footer className='footer'>
      <div className='footerContent'>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>A&B GSM</h3>
          <p style={{ color: '#9ca3af' }}>Computer parts</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Contact</h4>
          <p style={{ color: '#9ca3af' }}>Email: info@abgsm.hu</p>
          <p style={{ color: '#9ca3af' }}>Telefon: +36 1 234 5678</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Informations</h4>
          <p style={{ color: '#9ca3af' }}>ÁSZF</p>
          <p style={{ color: '#9ca3af' }}>Adatvédelem</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '1rem', textAlign: 'center', color: '#9ca3af' }}>
        <p>&copy; 2026 A&B GSM - All Copyright reserved.</p>
      </div>
    </footer>
  );
}
  
export default Footer;