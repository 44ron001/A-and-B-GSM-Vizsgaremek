# A&B GSM
## Infó
### Készítők
- Mohacsek Áron
- Uhrin Bence

### Célcsoport
- Webshopunk sok célcsoportot kiszolgálhat, mint például: Gamerek, Crypto bányászok, cégeknek

## Adatbázis
![Diagram](/adatbázis/diagram.jpg)

---

## **1. Entitáslista (táblák és mezők)**

| Entitás / Tábla        | Mezők                                                                    | Kulcsok                                                               |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| **users**              | userID (PK), nev, lakcim, telefon, email (UNIQUE), password, status, ban | PK: userID                                                            |
| **categories**         | kID (PK), kategoriaNev                                                   | PK: kID                                                               |
| **products**           | pID (PK), kID (FK), nev, ar, leiras                                      | PK: pID, FK: kID → categories.kID                                     |
| **product_attributes** | attrID (PK), pID (FK), paramnev, ertek                                   | PK: attrID, FK: pID → products.pID                                    |
| **stock**              | pID (PK, FK), db                                                         | PK: pID, FK: pID → products.pID                                       |
| **payments**           | fizID (PK), mivel, fizetve, datum                                        | PK: fizID                                                             |
| **orders**             | orderID (PK), userID (FK), fizID (FK), datum, allapot                    | PK: orderID, FK: userID → users.userID, FK: fizID → payments.fizID    |
| **order_items**        | orderItemID (PK), orderID (FK), pID (FK), darab, ar_akkor                | PK: orderItemID, FK: orderID → orders.orderID, FK: pID → products.pID |

---

## **2. Kapcsolatok (relációk)**

### **1–N kapcsolatok**

* **users → orders**: Egy felhasználó több rendelést adhat le, de egy rendelés csak egy felhasználóhoz tartozik.

  * `users.userID → orders.userID` (1:N)
* **categories → products**: Egy kategóriában több termék lehet, de egy termék csak egy kategóriához tartozik.

  * `categories.kID → products.kID` (1:N)
* **products → product_attributes**: Egy terméknek több attribútuma lehet, de az attribútum csak egy termékhez tartozik.

  * `products.pID → product_attributes.pID` (1:N)
* **products → stock**: Egy terméknek pontosan egy készlet sor felel meg.

  * `products.pID → stock.pID` (1:1)
* **payments → orders**: Egy fizetés több rendeléshez kapcsolódhat (esetleg), de egy rendeléshez csak egy fizetés tartozik.

  * `payments.fizID → orders.fizID` (1:N)
* **orders → order_items**: Egy rendelés több tételből állhat, de egy tétel csak egy rendeléshez tartozik.

  * `orders.orderID → order_items.orderID` (1:N)
* **products → order_items**: Egy termék több rendelés tételben is szerepelhet, de egy tétel csak egy termékre vonatkozik.

  * `products.pID → order_items.pID` (1:N)

### **N–M kapcsolatok**

* **orders ↔ products**: Technikai értelemben az `order_items` táblával van modellezve, így az N:M kapcsolat felbontva két 1:N kapcsolatra:

  * `orders → order_items → products`

---
