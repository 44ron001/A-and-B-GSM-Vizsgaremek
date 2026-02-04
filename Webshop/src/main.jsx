import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '/src/styles.css'
import Landing from '/src/pages/landing.jsx'
import Products from '/src/pages/products.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Landing/>} />
				<Route path="/videocards" element={<Products categoryId={2} categoryName="Videocards" fallbackImage="/src/images/gpu.png" />} />
				<Route path="/processors" element={<Products categoryId={1} categoryName="Processors" fallbackImage="/src/images/cpu.png" />} />
				<Route path="/motherboards" element={<Products categoryId={3} categoryName="Motherboards" fallbackImage="/src/images/motherboard.png" />} />
				<Route path="/ram" element={<Products categoryId={4} categoryName="Memories" fallbackImage="/src/images/memory.png" />} />
				<Route path="/psu" element={<Products categoryId={5} categoryName="Power supply units" fallbackImage="/src/images/psu.png" />} />
				<Route path="/pc-cases" element={<Products categoryId={6} categoryName="PC Cases" fallbackImage="/src/images/pc.png" />} />
				<Route path="/monitors" element={<Products categoryId={7} categoryName="Monitors" fallbackImage="/src/images/monitor.png" />} />
				<Route path="/coolers" element={<Products categoryId={8} categoryName="Coolers" fallbackImage="/src/images/cooler.png" />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);