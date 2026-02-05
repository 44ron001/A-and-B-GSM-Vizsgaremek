# A&B GSM
## Infó
### Készítők
- Mohacsek Áron: **Frontend(reactjs) + Adatbázis(mysql) + Backend(nodejs)**
- Uhrin Bence: **Alkalmazás(winforms) + Adatbázis(mysql) + Backend(nodejs)**

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



## API Endpoints

| Method | Endpoint                  | Leírás                              | Paraméterek | Válasz |
|--------|---------------------------|-------------------------------------|-------------|--------|
| GET    | /api/products/:categoryId | Termékek lekérése kategória alapján | categoryId (path) – a kategória azonosítója | JSON objektum termékekkel |

### Válasz példa

```json
{
  "success": true,
  "data": [
    {
      "pID": 1,
      "nev": "Gaming PC",
      "ar": 450000,
      "keszlet": 3,
      "attributes": { 
        /* további termék tulajdonságok */
      },
      "images": [ 
        /* képek listája */
      ]
    }
  ]
}
