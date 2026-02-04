# A&B GSM
## Infó
### Készítők
- Mohacsek Áron: **Weboldal + Adatbázis**
- Uhrin Bence: **Alkalmazás + Adatbázis**

### Célcsoport
- Webshopunk sok célcsoportot kiszolgálhat, mint például: Gamerek, Crypto bányászok, cégek.

## Adatbázis
![Diagram](/adatbazis/diagram.jpg)

---

## **Entitáslista (táblák és mezők)**

| Entitás / Tábla        | Mezők                                                                    | Kulcsok                                                               |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| **users**              | userID, nev, lakcim, telefon, email (UNIQUE), password, status, ban      | PK: userID                                                            |
| **categories**         | kID, kategoriaNev                                                        | PK: kID                                                               |
| **products**           | pID, kID, nev, ar, leiras                                                | PK: pID, FK: kID → categories.kID                                     |
| **product_attributes** | attrID, pID, paramnev, ertek                                             | PK: attrID, FK: pID → products.pID                                    |
| **stock**              | pID, db                                                                  | PK: pID, FK: pID → products.pID                                       |
| **payments**           | fizID, mivel, fizetve, datum                                             | PK: fizID                                                             |
| **orders**             | orderID, userID, fizID, datum, allapot                                   | PK: orderID, FK: userID → users.userID, FK: fizID → payments.fizID    |
| **order_items**        | orderItemID, orderID, pID, darab, ar_akkor                               | PK: orderItemID, FK: orderID → orders.orderID, FK: pID → products.pID |
---
