const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({host: 'localhost', user: 'root', password: '', database: 'pcshop' });
db.connect((err) => {
	if (err) { console.error('Database connection failed:', err); return; }
	console.log('Connected to MySQL database');
});

app.get('/api/products/:categoryId', (req, res) => {
	const categoryId = parseInt(req.params.categoryId);
const query = `
	SELECT p.pID, p.nev, p.ar, p.leiras, s.db as keszlet
	FROM products p
	LEFT JOIN stock s ON p.pID = s.pID
	WHERE p.kID = ?
	ORDER BY p.nev
`;

	db.query(query, [categoryId], (err, results) => {
		if (err) {
			console.error('Query error:', err);
			return res.status(500).json({
				success: false,
				message: 'Database query failed'
			});
		}
		const promises = results.map(product => {
			return new Promise((resolve, reject) => {
				const attrQuery = 'SELECT paramnev, ertek FROM product_attributes WHERE pID = ?';
				db.query(attrQuery, [product.pID], (err, attrs) => {
					if (err) {
						reject(err);
						return;
					}
					const attributes = {};
					attrs.forEach(attr => {
						attributes[attr.paramnev] = attr.ertek;
					});
					const imageQuery = 'SELECT imageID, image_data, is_primary, sorrend FROM product_images WHERE pID = ? ORDER BY is_primary DESC, sorrend ASC';
					db.query(imageQuery, [product.pID], (err, images) => {
						if (err) {
							reject(err);
							return;
						}
						resolve({
							...product,
							attributes,
							images: images.map(img => ({
								id: img.imageID,
								data: img.image_data,
								isPrimary: img.is_primary === 1,
								order: img.sorrend
							}))
						});
					});
				});
			});
		});
		Promise.all(promises)
			.then(products => {
				res.json({
					success: true,
					data: products
				});
			})
			.catch(err => {
				console.error('Error fetching product data:', err);
				res.status(500).json({
					success: false,
					message: 'Error fetching product data'
				});
			});
	});
});

app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });