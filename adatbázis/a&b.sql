-- -------------------------------
-- Adatbázis létrehozása ---------
-- -------------------------------
CREATE DATABASE IF NOT EXISTS pcshop
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_hungarian_ci;

USE pcshop;

-- -------------------------------
-- Felhasználók tábla (FRISSÍTVE)-
-- -------------------------------
CREATE TABLE users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    nev VARCHAR(100) NOT NULL,
    lakcim VARCHAR(255),
    telefon VARCHAR(30),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,     -- Jelszó (hash)
    status ENUM('admin', 'vevo', 'dolgozo') DEFAULT 'vevo',
    ban BOOLEAN DEFAULT 0               -- 0 = nincs ban, 1 = banolt
);

INSERT INTO users (nev, lakcim, telefon, email, password, status, ban) VALUES
('Kiss Péter', 'Budapest, Petőfi utca 5.', '06201234567', 'peter.kiss@example.com',
 '$2y$10$demoUserHashHERE', 'vevo', 0),

('Nagy Anna', 'Debrecen, Fő utca 12.', '06302345678', 'anna.nagy@example.com',
 '$2y$10$demoUserHashHERE', 'dolgozo', 0),

('Admin Béla', 'Budapest, Admin utca 1.', '0612345678', 'admin@example.com',
 '$2y$10$adminHashHERE', 'admin', 0);

-- -------------------------------
-- Kategóriák --------------------
-- -------------------------------
CREATE TABLE categories (
    kID INT AUTO_INCREMENT PRIMARY KEY,
    kategoriaNev VARCHAR(100) NOT NULL
);

INSERT INTO categories (kategoriaNev) VALUES
('Processzor'),
('Videokártya'),
('Alaplap'),
('RAM'),
('Tápegység');

-- -------------------------------
-- Termékek ---------------------
-- -------------------------------
CREATE TABLE products (
    pID INT AUTO_INCREMENT PRIMARY KEY,
    kID INT NOT NULL,
    nev VARCHAR(150) NOT NULL,
    ar INT NOT NULL,
    leiras TEXT,
    FOREIGN KEY (kID) REFERENCES categories(kID)
);

INSERT INTO products (kID, nev, ar, leiras) VALUES
(1, 'Intel Core i5 12400F', 52000, '6 mag, 12 szál, LGA1700'),
(1, 'AMD Ryzen 5 5600X', 72000, '6 mag, 12 szál, AM4'),
(2, 'NVIDIA RTX 3060 12GB', 160000, '12GB GDDR6, PCIe 4.0'),
(4, 'Kingston Fury 16GB DDR4 3200MHz', 18000, 'Gaming RAM'),
(5, 'Cooler Master 650W 80+ Bronze', 24000, 'Megbízható tápegység');

-- -------------------------------
-- EAV: Termék attribútumok ------
-- -------------------------------
CREATE TABLE product_attributes (
    attrID INT AUTO_INCREMENT PRIMARY KEY,
    pID INT NOT NULL,
    paramnev VARCHAR(100) NOT NULL,
    ertek VARCHAR(255) NOT NULL,
    FOREIGN KEY (pID) REFERENCES products(pID)
);

INSERT INTO product_attributes (pID, paramnev, ertek) VALUES
(1, 'Órajel', '4.4 GHz'),
(1, 'Foglalat', 'LGA1700'),
(2, 'Órajel', '4.6 GHz'),
(2, 'Foglalat', 'AM4'),
(3, 'Memória', '12 GB GDDR6');

-- -------------------------------
-- Készlet -----------------------
-- -------------------------------
CREATE TABLE stock (
    pID INT PRIMARY KEY,
    db INT NOT NULL,
    FOREIGN KEY (pID) REFERENCES products(pID)
);

INSERT INTO stock (pID, db) VALUES
(1, 12),
(2, 8),
(3, 5),
(4, 40),
(5, 20);

-- -------------------------------
-- Fizetések ---------------------
-- -------------------------------
CREATE TABLE payments (
    fizID INT AUTO_INCREMENT PRIMARY KEY,
    mivel VARCHAR(50) NOT NULL,
    fizetve BOOLEAN DEFAULT 0,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payments (mivel, fizetve) VALUES
('Bankkártya', 1),
('Utánvét', 0);

-- -------------------------------
-- Rendelések (fejléc) -----------
-- -------------------------------
CREATE TABLE orders (
    orderID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    fizID INT,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    allapot VARCHAR(50) DEFAULT 'Feldolgozás alatt',
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (fizID) REFERENCES payments(fizID)
);

INSERT INTO orders (userID, fizID, allapot) VALUES
(1, 1, 'Kiszállítva'),
(2, 2, 'Fizetésre vár');

-- -------------------------------
-- Rendelés tételek --------------
-- -------------------------------
CREATE TABLE order_items (
    orderItemID INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT NOT NULL,
    pID INT NOT NULL,
    darab INT NOT NULL,
    ar_akkor INT NOT NULL,
    FOREIGN KEY (orderID) REFERENCES orders(orderID),
    FOREIGN KEY (pID) REFERENCES products(pID)
);

INSERT INTO order_items (orderID, pID, darab, ar_akkor) VALUES
(1, 1, 1, 52000),
(1, 4, 2, 18000),
(2, 3, 1, 160000);
