//Importerar databas anslutningen
import { pool } from '../config/db.js';
import { numValidator } from '../middlewares/validators.js';


//Hämtar alla leverantörer
export async function getAllSuppliers(limit, offset) {

    //Hämtar ut total antal resultat
    //count(*) OVER() räknar totala antalet produkter i hela tabellen. Påverkas INTE av LIMIT och OFFSET
    //full_count aliaset används för att kunna plocka ut värdet från COUNT enklare
    //LIMIT och OFFSET begränsar antalet resultat
    //LEFT JOIN används för att hämta alla produkter även om de inte har en matchande kategori
    //Produkter får inte finnas utan en leverantör därför används INNER JOIN för suppliers tabellen
    const result = await pool.query(`SELECT *, 
        COUNT(*) OVER() AS full_count
        FROM suppliers 
        ORDER BY supplier_id 
        LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    let totalAmount;

    //If satsen behövs för att undvika fel när inga leverantörer finns i databasen
    //Tar ut totala antalet från första raden (alla rader har samma värde tack vare OVER())
    //result.rows är en array med objekt och result.rows[0] är det första objektet i arrayen med indexet 0
    //.full_count är egenskapen som innehåller det totala antalet
    if (result.rows.length > 0) {
        totalAmount = numValidator(result.rows[0].full_count, 'full_count');
    } else {
        totalAmount = 0;
    }

    // Tar bort full_count från result variablernas rader. Detta
    //för att ha en variabel med total antal och en med själva datan
    for (let rows of result.rows) {
        delete rows.full_count
    }

    //totalAmount kommer att innehålla det totala antalet produkter
    //result.rows kommer att returnera själva datan/innehållet
    return [totalAmount, result.rows];

}

export async function getSupplierByName(name, limit, offset) {

    //LOWER(name) konverterar produktnamnet i databasen
    //wildcard karaktärerna % matchar alla tecken före och efter söksträngen
    //name.toLowerCase() konverterar söksträngen så att sökningen inte blir case sensitive
    const result = await pool.query(`SELECT suppliers.*,
    COUNT(products.product_id) AS antal_produkter ,
    COUNT(*) OVER() AS full_count
    FROM suppliers 
    LEFT JOIN products 
    ON suppliers.supplier_id = products.supplier_id 
    GROUP BY suppliers.supplier_id 
    HAVING LOWER(suppliers.name) LIKE $1 
    LIMIT $2 OFFSET $3`,
        ['%' + name.toLowerCase() + '%', limit, offset]
    );

    let totalAmount;

    if (result.rows.length > 0) {
        totalAmount = numValidator(result.rows[0].full_count);
    } else {
        totalAmount = 0;
    }

    for (let rows of result.rows) {
        delete rows.full_count
    }

    return [totalAmount, result.rows];

}

//Hämta en leverantör och antal produkter leverantören har
export async function getSupplierByIDProductCount(id) {

    //Hämtar produkten från databasen och lägger det i variabeln result
    //$1 är en parameter placeholder som används i PostgreSQL för att skapa säkra SQL-frågor
    //och undvika SQL-injections

    const result = await pool.query(`SELECT suppliers.*, 
    COUNT(products.product_id) AS antal_produkter 
    FROM suppliers 
    INNER JOIN products 
    ON suppliers.supplier_id = products.supplier_id 
    GROUP BY suppliers.supplier_id 
    HAVING suppliers.supplier_id = $1`, [id]);

    /*Aggregeringsfunktioner slår ihop flera rader till en enda rad.
        Men om man också hämtar kolumner som inte är aggregerade(t.ex.suppliers.*), 
        då måste SQL veta hur raderna ska grupperas innan summeringen görs.
        Därför används GROUP BY*/

    return result.rows[0];

}


//Skapa ny leverantör
export async function createSupplier(name, contact_person_firstname, contact_person_secondname, email, phonenumber, country) {

    const query = `INSERT INTO suppliers 
    (name, contact_person_firstname, contact_person_secondname, email, phonenumber, country)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`; //Man ska alltid specificera i "returning" vad man vill returnera

    const values = [name, contact_person_firstname, contact_person_secondname, email, phonenumber, country];
    const result = await pool.query(query, values);

    return result.rows[0];

}


//Uppdatera en hel leverantör
export async function updateSupplier(name, contact_person_firstname, contact_person_secondname, email, phonenumber, country, id) {

    const query = `UPDATE suppliers 
    SET name = $1, 
    contact_person_firstname = $2, 
    contact_person_secondname = $3,
    email = $4,
    phonenumber = $5,
    country = $6
    WHERE supplier_id = $7
    RETURNING *`;

    const values = [name, contact_person_firstname, contact_person_secondname, email, phonenumber, country, id];

    const result = await pool.query(query, values);

    return result.rows[0];

}

//Uppdaterar endast namnet på en leverantör
export async function updateSupplierName(name, id) {

    const query = `UPDATE suppliers 
    SET name = $1
    WHERE supplier_id = $2
    RETURNING *`;

    const values = [name, id];

    const result = await pool.query(query, values);

    return result.rows[0];

}

//Uppdaterar endast landet för en leverantör
export async function updateSupplierCountry(country, id) {

    const query = `UPDATE suppliers 
    SET country = $1
    WHERE supplier_id = $2
    RETURNING *`;

    const values = [country, id];

    const result = await pool.query(query, values);

    return result.rows[0];

}

//Ta bort en leverantör
export async function deleteSupplier(id) {

    const result = await pool.query('DELETE FROM suppliers WHERE supplier_id = $1 RETURNING *', [id]);

    // undefined om leverantören inte finns
    return result.rows[0];

}


//hämta alla produkter från en specifik leverantör
export async function getAllProductsFromSupplier(id, limit, offset) {

    const result = await pool.query(`SELECT products.*,
    categories.name AS test,
    COUNT(*) OVER() AS full_count, 
    suppliers.name AS company 
    FROM products 
    INNER JOIN suppliers 
    ON products.supplier_id = suppliers.supplier_id
    LEFT JOIN categories 
    ON products.category_id = categories.category_id 
    WHERE suppliers.supplier_id = $1
    LIMIT $2 OFFSET $3`,
        [id, limit, offset]
    );

    const totalAmount = numValidator(result.rows[0].full_count, 'full_count');
    const supplierName = result.rows[0].company || null;

    for (let rows of result.rows) {
        delete rows.full_count
        delete rows.company
        delete rows.supplier_id
        delete rows.category_id
    }

    return [totalAmount, supplierName, result.rows];

}



