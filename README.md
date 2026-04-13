# A&B GSM

## Információk

### Készítők

* **Mohacsek Áron** – Frontend (React), Backend (Node.js), Adatbázis (MySQL), Dokumentáció
* **Uhrin Bence** – Desktop alkalmazás (WinForms), Backend (Node.js), Adatbázis (MySQL), PPT

### Célcsoport

A webshop többféle felhasználót is kiszolgál, például:

* Gamerek
* Kriptobányászok
* Cégek
* Programozók
* LLM-ek futtatása

---

## Projekt futtatása

### Ha nem szeretnéd helyben telepíteni

* **Live demo:** [https://glittery-biscochitos-dd9822.netlify.app/](https://glittery-biscochitos-dd9822.netlify.app/)
* **Online backend:** [https://a-and-b-gsm-vizsgaremek.onrender.com/api/products/1](https://a-and-b-gsm-vizsgaremek.onrender.com/api/products/1)
  *(Első betöltésnél előfordulhat, hogy fel kell “ébreszteni”, mert ingyenes hostingon fut.)*



### 1. Adatbázis és szerverek indítása

1. Indítsd el a **MySQL** szervert
2. Indítsd el az **Apache** szervert
3. Jegyezd meg a MySQL portját (pl. `3307`)
4. Ha még nem létezik a `pcshop` adatbázis, futtasd az `a&b.sql` fájlt az **Adatbazis** mappából

---

### 2. Backend indítása

1. Nyisd meg a terminált a **Backend** mappában
2. Futtasd a `Run.bat` fájlt
3. Add meg a MySQL portot

Ez elindítja az API szervert a következő címen:
`http://localhost:3001`

---

### 3. Frontend indítása

1. Nyisd meg a terminált a **Webshop** mappában
2. Futtasd a `Run.bat` fájlt

Alapértelmezett cím:
`http://localhost:8080`

---

### 4. Használat

Nyisd meg a böngészőt, majd navigálj ide:

```
http://localhost:8080
```

---


## Adatbázis 1.0
![Diagram](/adatbazis/diagram.jpg)

## Adatbázis 2.0
![Diagram](/adatbazis/diagram2.jpg)

## Adatbázis 3.0 (legfrissebb)
#### Entity-attribute-value model
![Diagram](/adatbazis/diagram3.jpg)

---
| **Tábla neve**         | **Mezők**                                                  | **Leírás / Megjegyzés**                                                                                |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **users**              | userID, nev, lakcim, telefon, email, password, status, ban | Felhasználók adatai; `status` lehet 'admin', 'vevo', 'dolgozo'; `ban` logikai érték                    |
| **categories**         | kID, kategoriaNev                                          | Termékkategóriák                                                                                       |
| **products**           | pID, kID, nev, ar, leiras                                  | Termékek; `kID` FK a `categories`-re; FULLTEXT a `nev` és `leiras` mezőkön                             |
| **product_attributes** | attrID, pID, paramnev, ertek                               | Termékek attribútumai EAV (Entity-Attribute-Value) modellben; FULLTEXT a `paramnev` és `ertek` mezőkön |
| **stock**              | pID, db                                                    | Készletadatok; `pID` FK a `products`-ra                                                                |
| **payments**           | fizID, mivel, fizetve, datum                               | Fizetési módok és státusz                                                                              |
| **orders**             | orderID, userID, fizID, datum, allapot                     | Rendelések fejléce; `userID` FK a `users`-re, `fizID` FK a `payments`-re                               |
| **order_items**        | orderItemID, orderID, pID, darab, ar_akkor                 | Rendelés tételek; `orderID` FK a `orders`-re, `pID` FK a `products`-ra                                 |
| **product_images**     | imageID, pID, image_data, is_primary, sorrend              | Termék képek; `pID` FK a `products`-ra, `ON DELETE CASCADE`                                            |
| **cart_items**         | userID, pID, darab                                         | Kosár tartalma; PK a `(userID, pID)`; `userID` FK a `users`-re, `pID` FK a `products`-ra               |
---



## API Endpoints

| Method | Endpoint                               | Leírás                                        | Paraméterek                                                                       | Válasz                                                      |
| ------ | -------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| GET    | /api/products/:categoryId              | Termékek lekérése kategória alapján           | categoryId (path) – a kategória azonosítója                                       | JSON objektum termékekkel, attribútumokkal és képekkel      |
| GET    | /api/product/:productID                | Egy termék részletes lekérése                 | productID (path) – a termék azonosítója                                           | JSON objektum a termékről, attribútumokkal és képekkel      |
| GET    | /api/search/:name                      | Termékek keresése név vagy leírás alapján     | name (path) – keresési kifejezés                                                  | JSON tömb releváns termékekkel, attribútumokkal és képekkel |
| POST   | /api/register                          | Felhasználó regisztráció                      | body: nev, email, password                                                        | JSON siker státusz                                          |
| POST   | /api/login                             | Felhasználó bejelentkezés                     | body: email, password                                                             | JSON tokennel és felhasználói adatokkal                     |
| GET    | /api/profile                           | Felhasználó profil lekérése                   | Authorization header: Bearer <token>                                              | JSON a felhasználó adataival                                |
| PUT    | /api/profile                           | Felhasználó profil módosítása                 | Authorization header: Bearer <token>, body: nev, email, password, telefon, lakcim | JSON a frissített felhasználói adatokkal                    |
| POST   | /api/cart                              | Termék hozzáadása a kosárhoz                  | Authorization header: Bearer <token>, body: pID, darab                            | JSON siker státusz                                          |
| GET    | /api/cart                              | Kosár tartalmának lekérése                    | Authorization header: Bearer <token>                                              | JSON tömb termékekkel és képekkel                           |
| PUT    | /api/cart                              | Kosárban lévő termék mennyiségének módosítása | Authorization header: Bearer <token>, body: pID, darab                            | JSON siker státusz                                          |
| DELETE | /api/cart/:pID                         | Termék törlése a kosárból                     | Authorization header: Bearer <token>, pID (path)                                  | JSON siker státusz                                          |
| PUT    | /api/product/:productID                | Termék adatainak módosítása                   | productID (path), body: nev, ar, leiras, keszlet, attributes                      | JSON siker státusz                                          |
| POST   | /api/product/:productID/image          | Új kép hozzáadása termékhez                   | productID (path), body: data (base64), isPrimary, order                           | JSON siker státusz és imageID                               |
| DELETE | /api/product/:productID/image/:imageID | Kép törlése termékből                         | productID, imageID (path)                                                         | JSON siker státusz                                          |
| PUT    | /api/product/:productID/image/:imageID | Kép módosítása (primary vagy sorrend)         | productID, imageID (path), body: isPrimary, order                                 | JSON siker státusz                                          |

### Legfontosabb API végpontok response példák
1. GET /api/products/:categoryId
```
{
  "success": true,
  "data": [
    {
      "pID": 1,
      "nev": "Gaming Laptop",
      "ar": 2500,
      "leiras": "High-end laptop with RTX 4070",
      "keszlet": 5,
      "attributes": {
        "CPU": "Intel i7",
        "RAM": "16GB",
        "Storage": "1TB SSD"
      },
      "images": [
        { "id": 101, "data": "<base64>", "isPrimary": true, "order": 0 },
        { "id": 102, "data": "<base64>", "isPrimary": false, "order": 1 }
      ]
    },
    {
      "pID": 2,
      "nev": "Mechanical Keyboard",
      "ar": 120,
      "leiras": "RGB mechanical keyboard",
      "keszlet": 10,
      "attributes": {
        "Switch": "Cherry MX Red",
        "Layout": "US"
      },
      "images": [
        { "id": 201, "data": "<base64>", "isPrimary": true, "order": 0 }
      ]
    }
  ]
}
```
2. GET /api/product/:productID
```
{
  "success": true,
  "data": {
    "pID": 1,
    "nev": "Gaming Laptop",
    "ar": 2500,
    "leiras": "High-end laptop with RTX 4070",
    "kID": 3,
    "kategoriaNev": "Laptops",
    "keszlet": 5,
    "attributes": {
      "CPU": "Intel i7",
      "RAM": "16GB",
      "Storage": "1TB SSD",
      "GPU": "RTX 4070"
    },
    "images": [
      { "id": 101, "data": "<base64>", "isPrimary": true, "order": 0 },
      { "id": 102, "data": "<base64>", "isPrimary": false, "order": 1 }
    ]
  }
}
```
3. GET /api/search/:name
```
{
  "success": true,
  "count": 2,
  "data": [
    {
      "pID": 1,
      "nev": "Gaming Laptop",
      "ar": 2500,
      "leiras": "High-end laptop with RTX 4070",
      "keszlet": 5,
      "attributes": { "CPU": "Intel i7", "RAM": "16GB", "Storage": "1TB SSD" },
      "images": [
        { "id": 101, "data": "<base64>", "isPrimary": true, "order": 0 }
      ]
    },
    {
      "pID": 3,
      "nev": "Laptop Cooling Pad",
      "ar": 45,
      "leiras": "Cooling pad for laptops up to 17\"",
      "keszlet": 15,
      "attributes": { "Fans": "2", "Color": "Black" },
      "images": [
        { "id": 301, "data": "<base64>", "isPrimary": true, "order": 0 }
      ]
    }
  ]
}
```
4. GET /api/cart
```
{
  "success": true,
  "data": [
    {
      "pID": 1,
      "darab": 2,
      "nev": "Gaming Laptop",
      "ar": 2500,
      "images": [
        { "id": 101, "data": "<base64>", "isPrimary": true, "order": 0 }
      ]
    },
    {
      "pID": 2,
      "darab": 1,
      "nev": "Mechanical Keyboard",
      "ar": 120,
      "images": [
        { "id": 201, "data": "<base64>", "isPrimary": true, "order": 0 }
      ]
    }
  ]
}
```
5. POST /api/login
```
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "userID": 1,
    "nev": "John Doe",
    "email": "john@example.com",
    "status": "user"
  }
}
```
6. GET /api/profile
```
{
  "success": true,
  "data": {
    "userID": 1,
    "nev": "John Doe",
    "email": "john@example.com",
    "telefon": "+36123456789",
    "lakcim": "Budapest, Hungary"
  }
}
```





