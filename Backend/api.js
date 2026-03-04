const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3001;


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecretkey"; // later move to .env

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({host: '127.0.0.1', port: 3307, user: 'root', password: '', database: 'pcshop' });
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


app.get('/api/product/:productID', (req, res) => {
	const productID = parseInt(req.params.productID);

	if (isNaN(productID)) {
		return res.status(400).json({
			success: false,
			message: 'Invalid product ID'
		});
	}

	const query = `
		SELECT 
			p.pID,
			p.nev,
			p.ar,
			p.leiras,
			p.kID,
			c.kategoriaNev,
			s.db as keszlet
		FROM products p
		LEFT JOIN categories c ON p.kID = c.kID
		LEFT JOIN stock s ON p.pID = s.pID
		WHERE p.pID = ?
	`;

	db.query(query, [productID], (err, results) => {
		if (err) {
			console.error('Query error:', err);
			return res.status(500).json({
				success: false,
				message: 'Database query failed'
			});
		}

		if (results.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		const product = results[0];

		// Attribútumok lekérése
		const attrQuery = `
			SELECT paramnev, ertek 
			FROM product_attributes 
			WHERE pID = ?
		`;

		db.query(attrQuery, [productID], (err, attrs) => {
			if (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: 'Error fetching attributes'
				});
			}

			const attributes = {};
			attrs.forEach(attr => {
				attributes[attr.paramnev] = attr.ertek;
			});

			// Képek lekérése
			const imageQuery = `
				SELECT imageID, image_data, is_primary, sorrend
				FROM product_images
				WHERE pID = ?
				ORDER BY is_primary DESC, sorrend ASC
			`;

			db.query(imageQuery, [productID], (err, images) => {
				if (err) {
					console.error(err);
					return res.status(500).json({
						success: false,
						message: 'Error fetching images'
					});
				}

				res.json({
					success: true,
					data: {
						...product,
						attributes,
						images: images.map(img => ({
							id: img.imageID,
							data: img.image_data,
							isPrimary: img.is_primary === 1,
							order: img.sorrend
						}))
					}
				});
			});
		});
	});
});





app.get('/api/search/:name', (req, res) => {
	const searchTerm = req.params.name;

	if (!searchTerm || searchTerm.length < 2) {
		return res.status(400).json({
			success: false,
			message: 'Search term too short'
		});
	}

	const query = `
		SELECT 
			p.pID,
			p.nev,
			p.ar,
			p.leiras,
			s.db as keszlet,
			
			-- Relevancia számítás
			(
				-- Fulltext súly
				MATCH(p.nev, p.leiras) AGAINST (? IN NATURAL LANGUAGE MODE) * 5 +
				
				-- Pontos név egyezés
				CASE 
					WHEN p.nev LIKE ? THEN 10
					ELSE 0
				END +
				
				-- Részleges név egyezés
				CASE 
					WHEN p.nev LIKE ? THEN 3
					ELSE 0
				END
				
			) AS relevance

		FROM products p
		LEFT JOIN stock s ON p.pID = s.pID
		WHERE 
			MATCH(p.nev, p.leiras) AGAINST (? IN NATURAL LANGUAGE MODE)
			OR p.nev LIKE ?
			OR p.leiras LIKE ?
		ORDER BY relevance DESC
		LIMIT 50
	`;

	const fullLike = `%${searchTerm}%`;
	const exactLike = searchTerm;

	db.query(
		query,
		[
			searchTerm,
			exactLike,
			fullLike,
			searchTerm,
			fullLike,
			fullLike
		],
		(err, results) => {
			if (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: 'Search failed'
				});
			}

			if (results.length === 0) {
				return res.json({
					success: true,
					data: []
				});
			}

			// Attribútumok + képek hozzáadása
			const promises = results.map(product => {
				return new Promise((resolve, reject) => {

					const attrQuery = `
						SELECT paramnev, ertek
						FROM product_attributes
						WHERE pID = ?
					`;

					db.query(attrQuery, [product.pID], (err, attrs) => {
						if (err) return reject(err);

						const attributes = {};
						attrs.forEach(attr => {
							attributes[attr.paramnev] = attr.ertek;
						});

						const imageQuery = `
							SELECT imageID, image_data, is_primary, sorrend
							FROM product_images
							WHERE pID = ?
							ORDER BY is_primary DESC, sorrend ASC
						`;

						db.query(imageQuery, [product.pID], (err, images) => {
							if (err) return reject(err);

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
						count: products.length,
						data: products
					});
				})
				.catch(err => {
					console.error(err);
					res.status(500).json({
						success: false,
						message: 'Error fetching product data'
					});
				});
		}
	);
});




app.post('/api/register', async (req, res) => {
	const { nev, email, password } = req.body;

	if (!nev || !email || !password) {
		return res.status(400).json({ success: false, message: "Missing fields" });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		db.query(
			'INSERT INTO users (nev, email, password) VALUES (?, ?, ?)',
			[nev, email, hashedPassword],
			(err) => {
				if (err) {
					return res.status(400).json({
						success: false,
						message: "Email already exists"
					});
				}

				res.json({ success: true });
			}
		);
	} catch (err) {
		res.status(500).json({ success: false });
	}
});


app.post('/api/login', (req, res) => {
	const { email, password } = req.body;

	db.query(
		'SELECT * FROM users WHERE email = ?',
		[email],
		async (err, results) => {
			if (err || results.length === 0) {
				return res.status(401).json({
					success: false,
					message: "Invalid credentials"
				});
			}

			const user = results[0];

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				return res.status(401).json({
					success: false,
					message: "Invalid credentials"
				});
			}

			const token = jwt.sign(
				{ userID: user.userID, status: user.status },
				JWT_SECRET,
				{ expiresIn: "7d" }
			);

			res.json({
				success: true,
				token,
				user: {
					userID: user.userID,
					nev: user.nev,
					email: user.email,
					status: user.status
				}
			});
		}
	);
});



function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.sendStatus(401);

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}


app.get('/api/profile', authenticateToken, (req, res) => {
	db.query(
		'SELECT userID, nev, email, lakcim, telefon FROM users WHERE userID = ?',
		[req.user.userID],
		(err, results) => {
			if (err || results.length === 0) {
				return res.status(404).json({ success: false });
			}
			res.json({ success: true, data: results[0] });
		}
	);
});

app.put('/api/profile', authenticateToken, async (req, res) => {
	try {
		const { nev, email, password, telefon, lakcim } = req.body;

		// Prepare fields to update
		const updates = [];
		const values = [];

		if (nev) { updates.push('nev=?'); values.push(nev); }
		if (email) { updates.push('email=?'); values.push(email); }
		if (telefon) { updates.push('telefon=?'); values.push(telefon); }
		if (lakcim) { updates.push('lakcim=?'); values.push(lakcim); }

		if (password) {
			const hashed = await bcrypt.hash(password, 10);
			updates.push('password=?');
			values.push(hashed);
		}

		if (updates.length === 0) {
			return res.status(400).json({ success: false, message: "No fields to update" });
		}

		values.push(req.user.userID); // for WHERE userID=?

		const sql = `UPDATE users SET ${updates.join(', ')} WHERE userID=?`;

		db.query(sql, values, (err) => {
			if (err) return res.status(500).json({ success: false, message: err.message });

			// Return updated user
			db.query(
				'SELECT userID, nev, email, telefon, lakcim FROM users WHERE userID=?',
				[req.user.userID],
				(err2, results) => {
					if (err2 || results.length === 0) return res.status(500).json({ success: false });
					res.json({ success: true, user: results[0] });
				}
			);
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

app.put('/api/product/:productID', (req, res) => {
	const productID = parseInt(req.params.productID);
	if (isNaN(productID)) {
	  return res.status(400).json({ success: false, message: 'Invalid product ID' });
	}
  
	const { nev, ar, leiras, keszlet, attributes } = req.body;
  
	if (typeof nev !== 'string' || nev.trim().length < 1) {
	  return res.status(400).json({ success: false, message: 'Invalid nev' });
	}
	if (!Number.isInteger(ar) || ar < 0) {
	  return res.status(400).json({ success: false, message: 'Invalid ar' });
	}
	if (typeof leiras !== 'string') {
	  return res.status(400).json({ success: false, message: 'Invalid leiras' });
	}
	if (!Number.isInteger(keszlet) || keszlet < 0) {
	  return res.status(400).json({ success: false, message: 'Invalid keszlet' });
	}
  
	const attrObj = (attributes && typeof attributes === 'object') ? attributes : {};
  
	db.beginTransaction((err) => {
	  if (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: 'Transaction start failed' });
	  }
  
	  // 1) products update
	  db.query(
		'UPDATE products SET nev=?, ar=?, leiras=? WHERE pID=?',
		[nev.trim(), ar, leiras, productID],
		(err, result) => {
		  if (err) return db.rollback(() => {
			console.error(err);
			res.status(500).json({ success: false, message: 'Update products failed' });
		  });
  
		  if (result.affectedRows === 0) return db.rollback(() => {
			res.status(404).json({ success: false, message: 'Product not found' });
		  });
  
		  // 2) stock upsert (stock: pID, db)
		  db.query(
			'INSERT INTO stock (pID, db) VALUES (?, ?) ON DUPLICATE KEY UPDATE db=VALUES(db)',
			[productID, keszlet],
			(err) => {
			  if (err) return db.rollback(() => {
				console.error(err);
				res.status(500).json({ success: false, message: 'Update stock failed' });
			  });
  
			  // 3) attributes: delete + insert
			  db.query(
				'DELETE FROM product_attributes WHERE pID=?',
				[productID],
				(err) => {
				  if (err) return db.rollback(() => {
					console.error(err);
					res.status(500).json({ success: false, message: 'Delete attributes failed' });
				  });
  
				  const keys = Object.keys(attrObj);
				  if (keys.length === 0) {
					return db.commit((err) => {
					  if (err) return db.rollback(() => {
						console.error(err);
						res.status(500).json({ success: false, message: 'Commit failed' });
					  });
					  res.json({ success: true });
					});
				  }
  
				  const values = keys.map(k => [productID, k, String(attrObj[k])]);
  
				  db.query(
					'INSERT INTO product_attributes (pID, paramnev, ertek) VALUES ?',
					[values],
					(err) => {
					  if (err) return db.rollback(() => {
						console.error(err);
						res.status(500).json({ success: false, message: 'Insert attributes failed' });
					  });
  
					  db.commit((err) => {
						if (err) return db.rollback(() => {
						  console.error(err);
						  res.status(500).json({ success: false, message: 'Commit failed' });
						});
						res.json({ success: true });
					  });
					}
				  );
				}
			  );
			}
		  );
		}
	  );
	});
  });

  app.post('/api/product/:productID/image', (req, res) => {
	const productID = parseInt(req.params.productID);
	if (isNaN(productID)) {
	  return res.status(400).json({ success: false, message: 'Invalid product ID' });
	}
  
	let { data, isPrimary, order } = req.body;
  
	if (typeof data !== 'string' || data.length < 10) {
	  return res.status(400).json({ success: false, message: 'Missing image base64 data' });
	}
  
	// ha "data:image/png;base64,..." formában jönne, levágjuk az elejét
	const commaIndex = data.indexOf(',');
	if (commaIndex !== -1) data = data.substring(commaIndex + 1);
  
	isPrimary = isPrimary ? 1 : 0;
	order = Number.isInteger(order) ? order : 0;
  
	db.beginTransaction((err) => {
	  if (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: 'Transaction start failed' });
	  }
  
	  const setPrimaryIfNeeded = (cb) => {
		if (!isPrimary) return cb();
  
		// ha ez primary, akkor a többit levesszük primary-ról
		db.query(
		  'UPDATE product_images SET is_primary = 0 WHERE pID = ?',
		  [productID],
		  (err) => {
			if (err) return cb(err);
			cb();
		  }
		);
	  };
  
	  setPrimaryIfNeeded((err) => {
		if (err) return db.rollback(() => {
		  console.error(err);
		  res.status(500).json({ success: false, message: 'Primary reset failed' });
		});
  
		db.query(
		  'INSERT INTO product_images (pID, image_data, is_primary, sorrend) VALUES (?, ?, ?, ?)',
		  [productID, data, isPrimary, order],
		  (err, result) => {
			if (err) return db.rollback(() => {
			  console.error(err);
			  res.status(500).json({ success: false, message: 'Insert image failed' });
			});
  
			db.commit((err) => {
			  if (err) return db.rollback(() => {
				console.error(err);
				res.status(500).json({ success: false, message: 'Commit failed' });
			  });
  
			  res.json({ success: true, imageID: result.insertId });
			});
		  }
		);
	  });
	});
  });

// KÉP TÖRLÉSE
app.delete('/api/product/:productID/image/:imageID', (req, res) => {
	const productID = parseInt(req.params.productID);
	const imageID = parseInt(req.params.imageID);
  
	if (isNaN(productID) || isNaN(imageID)) {
	  return res.status(400).json({ success: false, message: 'Invalid IDs' });
	}
  
	db.beginTransaction((err) => {
	  if (err) return res.status(500).json({ success: false, message: 'Transaction start failed' });
  
	  db.query(
		'SELECT is_primary FROM product_images WHERE pID=? AND imageID=?',
		[productID, imageID],
		(err, rows) => {
		  if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Select failed' }));
		  if (!rows || rows.length === 0) return db.rollback(() => res.status(404).json({ success: false, message: 'Image not found' }));
  
		  const wasPrimary = rows[0].is_primary === 1;
  
		  db.query(
			'DELETE FROM product_images WHERE pID=? AND imageID=?',
			[productID, imageID],
			(err, result) => {
			  if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Delete failed' }));
			  if (result.affectedRows === 0) return db.rollback(() => res.status(404).json({ success: false, message: 'Image not found' }));
  
			  const ensurePrimary = (cb) => {
				if (!wasPrimary) return cb();
  
				db.query(
				  `UPDATE product_images
				   SET is_primary = CASE WHEN imageID = (
					  SELECT t.imageID FROM (
						SELECT imageID FROM product_images
						WHERE pID = ?
						ORDER BY sorrend ASC, imageID ASC
						LIMIT 1
					  ) t
				   ) THEN 1 ELSE 0 END
				   WHERE pID = ?`,
				  [productID, productID],
				  (err) => cb(err)
				);
			  };
  
			  ensurePrimary((err) => {
				if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Primary fix failed' }));
  
				db.commit((err) => {
				  if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Commit failed' }));
				  res.json({ success: true });
				});
			  });
			}
		  );
		}
	  );
	});
  });
  
  // KÉP MÓDOSÍTÁSA (primary + sorrend)
  app.put('/api/product/:productID/image/:imageID', (req, res) => {
	const productID = parseInt(req.params.productID);
	const imageID = parseInt(req.params.imageID);
  
	if (isNaN(productID) || isNaN(imageID)) {
	  return res.status(400).json({ success: false, message: 'Invalid IDs' });
	}
  
	let { isPrimary, order } = req.body;
  
	const hasIsPrimary = typeof isPrimary !== 'undefined';
	const hasOrder = typeof order !== 'undefined';
  
	if (!hasIsPrimary && !hasOrder) {
	  return res.status(400).json({ success: false, message: 'Nothing to update' });
	}
  
	isPrimary = isPrimary ? 1 : 0;
	order = Number.isInteger(order) ? order : 0;
  
	db.beginTransaction((err) => {
	  if (err) return res.status(500).json({ success: false, message: 'Transaction start failed' });
  
	  const resetPrimaryIfNeeded = (cb) => {
		if (!hasIsPrimary || !isPrimary) return cb();
		db.query(
		  'UPDATE product_images SET is_primary = 0 WHERE pID = ?',
		  [productID],
		  (err) => cb(err)
		);
	  };
  
	  resetPrimaryIfNeeded((err) => {
		if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Primary reset failed' }));
  
		const sets = [];
		const values = [];
  
		if (hasIsPrimary) { sets.push('is_primary=?'); values.push(isPrimary); }
		if (hasOrder) { sets.push('sorrend=?'); values.push(order); }
  
		values.push(productID, imageID);
  
		db.query(
		  `UPDATE product_images SET ${sets.join(', ')} WHERE pID=? AND imageID=?`,
		  values,
		  (err, result) => {
			if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Update failed' }));
			if (result.affectedRows === 0) return db.rollback(() => res.status(404).json({ success: false, message: 'Image not found' }));
  
			db.commit((err) => {
			  if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Commit failed' }));
			  res.json({ success: true });
			});
		  }
		);
	  });
	});
  });

app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });