const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3001;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "supersecretkey";

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Kérem adja meg a MYSQL localhost portját: ', (ans) => {
  rl.close();
  const PORT2 = parseInt(ans) || 3007;


app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: '127.0.0.1',
  port: PORT2,
  user: 'root',
  password: '',
  database: 'pcshop'
});

db.connect((err) => {
  if (err) { console.error('Database connection failed:', err); return; }
  console.log('Connected to MySQL database');
});


const dbPromise = db.promise();


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
      return res.status(500).json({ success: false, message: 'Database query failed' });
    }

    const promises = results.map(product => {
      return new Promise((resolve, reject) => {
        const attrQuery = 'SELECT paramnev, ertek FROM product_attributes WHERE pID = ?';
        db.query(attrQuery, [product.pID], (err, attrs) => {
          if (err) { reject(err); return; }

          const attributes = {};
          attrs.forEach(attr => { attributes[attr.paramnev] = attr.ertek; });

          const imageQuery = 'SELECT imageID, image_data, is_primary, sorrend FROM product_images WHERE pID = ? ORDER BY is_primary DESC, sorrend ASC';
          db.query(imageQuery, [product.pID], (err, images) => {
            if (err) { reject(err); return; }
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
      .then(products => res.json({ success: true, data: products }))
      .catch(err => {
        console.error('Error fetching product data:', err);
        res.status(500).json({ success: false, message: 'Error fetching product data' });
      });
  });
});


app.get('/api/product/:productID', (req, res) => {
  const productID = parseInt(req.params.productID);
  if (isNaN(productID)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const query = `
    SELECT p.pID, p.nev, p.ar, p.leiras, p.kID, c.kategoriaNev, s.db as keszlet
    FROM products p
    LEFT JOIN categories c ON p.kID = c.kID
    LEFT JOIN stock s ON p.pID = s.pID
    WHERE p.pID = ?
  `;

  db.query(query, [productID], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ success: false, message: 'Database query failed' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = results[0];

    db.query('SELECT paramnev, ertek FROM product_attributes WHERE pID = ?', [productID], (err, attrs) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error fetching attributes' });
      }

      const attributes = {};
      attrs.forEach(attr => { attributes[attr.paramnev] = attr.ertek; });

      const imageQuery = `
        SELECT imageID, image_data, is_primary, sorrend
        FROM product_images
        WHERE pID = ?
        ORDER BY is_primary DESC, sorrend ASC
      `;

      db.query(imageQuery, [productID], (err, images) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Error fetching images' });
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
    return res.status(400).json({ success: false, message: 'Search term too short' });
  }

  const query = `
    SELECT
      p.pID, p.nev, p.ar, p.leiras, s.db as keszlet,
      (
        MATCH(p.nev, p.leiras) AGAINST (? IN NATURAL LANGUAGE MODE) * 5 +
        CASE WHEN p.nev LIKE ? THEN 10 ELSE 0 END +
        CASE WHEN p.nev LIKE ? THEN 3 ELSE 0 END
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

  db.query(query, [searchTerm, searchTerm, fullLike, searchTerm, fullLike, fullLike], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Search failed' });
    }

    if (results.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const promises = results.map(product => {
      return new Promise((resolve, reject) => {
        db.query('SELECT paramnev, ertek FROM product_attributes WHERE pID = ?', [product.pID], (err, attrs) => {
          if (err) return reject(err);

          const attributes = {};
          attrs.forEach(attr => { attributes[attr.paramnev] = attr.ertek; });

          db.query(
            'SELECT imageID, image_data, is_primary, sorrend FROM product_images WHERE pID = ? ORDER BY is_primary DESC, sorrend ASC',
            [product.pID],
            (err, images) => {
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
            }
          );
        });
      });
    });

    Promise.all(promises)
      .then(products => res.json({ success: true, count: products.length, data: products }))
      .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching product data' });
      });
  });
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
        if (err) return res.status(400).json({ success: false, message: "Email already exists" });
        res.json({ success: true });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userID: user.userID, status: user.status },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { userID: user.userID, nev: user.nev, email: user.email, status: user.status }
    });
  });
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

function requireAdmin(req, res, next) {
  if (!req.user || req.user.status !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
}


app.get('/api/profile', authenticateToken, (req, res) => {
  db.query(
    'SELECT userID, nev, email, lakcim, telefon FROM users WHERE userID = ?',
    [req.user.userID],
    (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ success: false });
      res.json({ success: true, data: results[0] });
    }
  );
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { nev, email, password, telefon, lakcim } = req.body;
    const updates = [];
    const values = [];

    if (nev)    { updates.push('nev=?');     values.push(nev); }
    if (email)  { updates.push('email=?');   values.push(email); }
    if (telefon){ updates.push('telefon=?'); values.push(telefon); }
    if (lakcim) { updates.push('lakcim=?');  values.push(lakcim); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password=?');
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(req.user.userID);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE userID=?`;

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

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


app.post("/api/cart", authenticateToken, async (req, res) => {
  const userID = req.user.userID;
  const { pID, darab } = req.body;
  try {
    await dbPromise.query(
      `INSERT INTO cart_items (userID, pID, darab)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE darab = darab + ?`,
      [userID, pID, darab || 1, darab || 1]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/cart", authenticateToken, async (req, res) => {
  const userID = req.user.userID;

  try {
    const [cartItems] = await dbPromise.query(`
      SELECT c.pID, c.darab, p.nev, p.ar
      FROM cart_items c
      JOIN products p ON c.pID = p.pID
      WHERE c.userID = ?
    `, [userID]);

    const promises = cartItems.map(item => {
      return new Promise((resolve, reject) => {
        db.query(
          `SELECT imageID, image_data, is_primary, sorrend
           FROM product_images
           WHERE pID = ?
           ORDER BY is_primary DESC, sorrend ASC`,
          [item.pID],
          (err, images) => {
            if (err) return reject(err);

            resolve({
              ...item,
              images: images.map(img => ({
                id: img.imageID,
                data: img.image_data,
                isPrimary: img.is_primary === 1,
                order: img.sorrend
              }))
            });
          }
        );
      });
    });

    const fullCart = await Promise.all(promises);

    res.json({ success: true, data: fullCart });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/cart", authenticateToken, async (req, res) => {
  const userID = req.user.userID;
  const { pID, darab } = req.body;
  try {
    await dbPromise.query(
      "UPDATE cart_items SET darab = ? WHERE userID = ? AND pID = ?",
      [darab, userID, pID]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/cart/:pID", authenticateToken, async (req, res) => {
  const userID = req.user.userID;
  const { pID } = req.params;
  try {
    await dbPromise.query(
      "DELETE FROM cart_items WHERE userID = ? AND pID = ?",
      [userID, pID]
    );
    res.json({ success: true });
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

  app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    db.query(
      `SELECT userID, nev, email, lakcim, telefon, status, ban
       FROM users
       ORDER BY userID`,
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
  
        res.json({ success: true, data: results });
      }
    );
  });
  
  app.get('/api/admin/users/:id/cart', authenticateToken, requireAdmin, (req, res) => {
    const userID = parseInt(req.params.id);
  
    if (isNaN(userID)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
  
    db.query(`
      SELECT 
        c.pID,
        p.nev,
        p.ar,
        c.darab,
        (p.ar * c.darab) AS osszeg
      FROM cart_items c
      JOIN products p ON c.pID = p.pID
      WHERE c.userID = ?
      ORDER BY p.nev
    `, [userID], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
  
      res.json({ success: true, data: results });
    });
  });
  
  app.get('/api/admin/users', authenticateToken, (req, res) => {
    if (req.user.status !== "admin") {
      return res.status(403).json({ success: false });
    }
  
    db.query(
      'SELECT userID, nev, email, status FROM users',
      (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, data: results });
      }
    );
  });
  
  app.get('/api/admin/user/:id/cart', authenticateToken, (req, res) => {
    if (req.user.status !== "admin") {
      return res.status(403).json({ success: false });
    }
  
    const userID = req.params.id;
  
    db.query(`
      SELECT c.pID, p.nev, p.ar, c.darab
      FROM cart_items c
      JOIN products p ON c.pID = p.pID
      WHERE c.userID = ?
    `, [userID], (err, results) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, data: results });
    });
  });
  
  app.get('/api/admin/user/:id/orders', authenticateToken, (req, res) => {
    if (req.user.status !== "admin") {
      return res.status(403).json({ success: false });
    }
  
    const userID = req.params.id;
  
    db.query(`
      SELECT o.orderID, o.datum, o.allapot,
             SUM(oi.darab * oi.ar_akkor) as osszeg
      FROM orders o
      JOIN order_items oi ON o.orderID = oi.orderID
      WHERE o.userID = ?
      GROUP BY o.orderID, o.datum, o.allapot
      ORDER BY o.datum DESC
    `, [userID], (err, results) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, data: results });
    });
  });






// GET payment methods
app.get('/api/payments', authenticateToken, (req, res) => {
  db.query('SELECT * FROM payments', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

// POST checkout
app.post('/api/checkout', authenticateToken, async (req, res) => {
  const userID = req.user.userID;
  const { szallitasiCim, fizetesiMod, saveAddress } = req.body;

  if (!szallitasiCim || !fizetesiMod) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Get cart items
    const [cartItems] = await dbPromise.query(
      `SELECT c.pID, c.darab, p.ar FROM cart_items c
       JOIN products p ON c.pID = p.pID
       WHERE c.userID = ?`,
      [userID]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Find or create payment
    const [payRows] = await dbPromise.query(
      'SELECT fizID FROM payments WHERE mivel = ? LIMIT 1',
      [fizetesiMod]
    );

    let fizID;
    if (payRows.length > 0) {
      fizID = payRows[0].fizID;
    } else {
      const [ins] = await dbPromise.query(
        'INSERT INTO payments (mivel, fizetve) VALUES (?, 0)',
        [fizetesiMod]
      );
      fizID = ins.insertId;
    }

    // Create order
    const [orderResult] = await dbPromise.query(
      `INSERT INTO orders (userID, fizID, allapot) VALUES (?, ?, 'Feldolgozás alatt')`,
      [userID, fizID]
    );
    const orderID = orderResult.insertId;

    // Insert order items
    const itemValues = cartItems.map(i => [orderID, i.pID, i.darab, i.ar]);
    await dbPromise.query(
      'INSERT INTO order_items (orderID, pID, darab, ar_akkor) VALUES ?',
      [itemValues]
    );

    // Save address if requested
    if (saveAddress && szallitasiCim) {
      await dbPromise.query(
        'UPDATE users SET lakcim = ? WHERE userID = ?',
        [szallitasiCim, userID]
      );
    }

    // Clear cart
    await dbPromise.query('DELETE FROM cart_items WHERE userID = ?', [userID]);

    res.json({ success: true, orderID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/order/:orderID/details', authenticateToken, requireAdmin, (req, res) => {
  const orderID = parseInt(req.params.orderID);

  if (isNaN(orderID)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  const orderQuery = `
    SELECT o.orderID, o.userID, o.datum, o.allapot, p.fizID, pay.mivel
    FROM orders o
    LEFT JOIN payments pay ON o.fizID = pay.fizID
    LEFT JOIN payments p ON o.fizID = p.fizID
    WHERE o.orderID = ?
    LIMIT 1
  `;

  db.query(orderQuery, [orderID], (err, orderRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const itemsQuery = `
      SELECT 
        oi.orderItemID,
        oi.pID,
        p.nev,
        oi.darab,
        oi.ar_akkor,
        (oi.darab * oi.ar_akkor) AS osszeg
      FROM order_items oi
      JOIN products p ON oi.pID = p.pID
      WHERE oi.orderID = ?
      ORDER BY p.nev
    `;

    db.query(itemsQuery, [orderID], (err, itemRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        data: {
          ...orderRows[0],
          items: itemRows || []
        }
      });
    });
  });
});

app.put('/api/admin/order/:orderID/status', authenticateToken, requireAdmin, (req, res) => {
  const orderID = parseInt(req.params.orderID);
  const { allapot } = req.body;

  if (isNaN(orderID)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  if (!allapot || typeof allapot !== 'string' || allapot.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  db.query(
    'UPDATE orders SET allapot = ? WHERE orderID = ?',
    [allapot.trim(), orderID],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({ success: true, message: 'Status updated' });
    }
  );
});

app.post('/api/admin/order/:orderID/ship', authenticateToken, requireAdmin, (req, res) => {
  const orderID = parseInt(req.params.orderID);

  if (isNaN(orderID)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  db.query(
    'UPDATE orders SET allapot = ? WHERE orderID = ?',
    ['Kiszállítva', orderID],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({ success: true, message: 'Order shipped' });
    }
  );
});

app.get('/api/admin/user/:id/orders', authenticateToken, requireAdmin, (req, res) => {
  const userID = req.params.id;

  db.query(`
    SELECT o.orderID, o.datum, o.allapot,
           SUM(oi.darab * oi.ar_akkor) as osszeg
    FROM orders o
    JOIN order_items oi ON o.orderID = oi.orderID
    WHERE o.userID = ?
    GROUP BY o.orderID, o.datum, o.allapot
    ORDER BY o.datum DESC
  `, [userID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, data: results });
  });
});


















app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });

});