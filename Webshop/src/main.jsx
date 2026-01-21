import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import './script.js'
import App from './app.jsx'
import App2 from './aszf.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/app" element={<App />} />
				<Route path="/app2" element={<App2 />} />
				<Route path="/" element={<Navigate to="/app" replace />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);