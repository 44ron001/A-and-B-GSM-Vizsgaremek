# A&B GSM
## Infó
### Készítők
- Mohacsek Áron: **Frontend(reactjs) + Adatbázis(mysql) + Backend(nodejs)**
- Uhrin Bence: **Alkalmazás(winforms) + Adatbázis(mysql) + Backend(nodejs)**

### Célcsoport
- Webshopunk sok célcsoportot kiszolgálhat, mint például: Gamerek, Crypto bányászok, cégek.

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




## Hogyan futtassuk a projektet

### 1. Adatbázis és szerverek indítása

1. Indítsd el a **MySQL** szervert.
2. Indítsd el az **Apache** szervert.
3. Győződj meg róla, hogy a MySQL portja (pl. 3307) és a `pcshop` adatbázis létezik a konfiguráció szerint.
4. Ha nem létezik futtasd le az "a&b.sql" fájlt az Adatbazis mappából.
---

### 2. Backend futtatása

1. Nyisd meg a terminált vagy fájlkezelőt a **backend** mappában.
2. Futtasd az `init.bat` fájlt.
3. Futtasd a `run.bat` fájlt.

```bat
init.bat
run.bat
```

* Ez elindítja az **api.js** szervert a `http://localhost:3001` címen.

---

### 3. Webshop frontend futtatása

1. Nyisd meg a terminált a **webshop** mappában.
2. Először futtad az init-et:

```bat
init.bat
```

3. Aztán futtasd a build-et:
```bat
build.bat
```

3. Végül indítsd a frontend szervert:

```bat
run.bat
```

* Alapértelmezett port: `http://localhost:8080`

---

### 4. Böngészőben való használat

* Nyisd meg a böngészőt és navigálj ide:

```
http://localhost:8080
```

---
