//Importerar databas anslutningen
import { pool } from '../config/db.js';
import { numValidator } from '../middlewares/validators.js';

//Hämtar alla producter
export async function getAllProducts(limit, offset) {

    //Hämtar ut total antal resultat
    //count(*) OVER() räknar totala antalet produkter i hela tabellen. Påverkas INTE av LIMIT och OFFSET
    //full_count aliaset används för att kunna plocka ut värdet från COUNT enklare
    //LIMIT och OFFSET begränsar antalet resultat
    //LEFT JOIN används för att hämta alla produkter även om de inte har en matchande kategori
    //Produkter får inte finnas utan en leverantör därför används INNER JOIN för suppliers tabellen
    const result = await pool.query(`SELECT products.*, 
        categories.name AS category,
        suppliers.name AS supplier, 
        count(*) OVER() AS full_count
        FROM products
        LEFT JOIN categories ON products.category_id = categories.category_id
        INNER JOIN suppliers ON products.supplier_id = suppliers.supplier_id
        ORDER BY products.product_id ASC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    //Tar ut totala antalet från första raden (alla rader har samma värde tack vare OVER())
    //result.rows är en array med objekt och result.rows[0] är det första objektet i arrayen med indexet 0
    //.full_count är egenskapen som innehåller det totala antalet
    const totalAmount = numValidator(result.rows[0].full_count, 'full_count');

    // Tar bort full_count från result variablernas rader. Detta
    //för att ha en variabel med total antal och en med själva datan
    for (let rows of result.rows) {

        //loopar igenom varje objekt i result.rows arrayen
        //delete tar bort en egenskap från ett objekt
        //Här tas bort category_id och supplier_id endast för att inte skicka överflödig data till klienten
        delete rows.full_count
        delete rows.category_id
        delete rows.supplier_id
    }

    //totalAmount kommer att innehålla det totala antalet produkter
    //result.rows kommer att returnera själva datan/innehållet
    return [totalAmount, result.rows];

}

//Hämtar en produkt baserat på titel
export async function getProductByName(name, limit, offset) {

    //LOWER(name) konverterar produktnamnet i databasen
    //wildcard karaktärerna % matchar alla tecken före och efter söksträngen
    //name.toLowerCase() konverterar söksträngen så att sökningen inte blir case sensitive
    const result = await pool.query(`SELECT products.*,
        categories.name AS category,
        suppliers.name AS supplier,
        count(*) OVER() AS full_count  
        FROM products 
        LEFT JOIN categories ON products.category_id = categories.category_id
        INNER JOIN suppliers ON products.supplier_id = suppliers.supplier_id
        WHERE LOWER(products.name) LIKE $1
        LIMIT $2 OFFSET $3`,
        ['%' + name.toLowerCase() + '%', limit, offset]
    );

    const totalAmount = numValidator(result.rows[0].full_count, 'full_count');

    for (let rows of result.rows) {
        delete rows.full_count
        delete rows.category_id
        delete rows.supplier_id
    }

    return [totalAmount, result.rows];
}

//Hämtar specifika produkter baserat på id
export async function getProductById(id) {

    //Hämtar produkten från databasen och lägger det i variabeln result
    //$1 är en parameter placeholder som används i PostgreSQL för att skapa säkra SQL-frågor
    //och undvika SQL-injections
    const result = await pool.query(`SELECT products.*,
        categories.name AS category,
        suppliers.name AS supplier
        FROM products
        LEFT JOIN categories ON products.category_id = categories.category_id
        INNER JOIN suppliers ON products.supplier_id = suppliers.supplier_id 
        WHERE products.product_id = $1`,
        [id]
    );

    for (let rows of result.rows) {
        delete rows.category_id
        delete rows.supplier_id
    }

    //result.rows[0] returnerar antingen en objekt eller undefined
    return result.rows[0];

}

//Skapar ny produkt
export async function createProduct(name, stock_quantity, price, category_id, supplier_id) {

    //Queryn och värdena skickas seperat på grund av säkerhetsskäl
    // Returning kommer att returnera den nya raden som skapades
    const query = `INSERT INTO products 
    (name, stock_quantity, price, category_id, supplier_id) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`;
    const values = [name, stock_quantity, price, category_id, supplier_id];

    //PostgreSQL sammanfogar queryn med användarens input. PostgreSQL kommer att byta ut
    //placeholder värdena $1-$4 mot values arrayens värden
    const result = await pool.query(query, values);


    return result.rows[0];

}

//Uppdaterar en hel produkt
export async function updateProduct(name, stock_quantity, price, category_id, supplier_id, product_id) {

    const query = `UPDATE products 
    SET name = $1, 
    stock_quantity = $2, 
    price = $3,
    category_id = $4,  
    supplier_id = $5 
    WHERE product_id = $6 RETURNING *`;

    const values = [name, stock_quantity, price, category_id, supplier_id, product_id];

    const result = await pool.query(query, values);

    return result.rows[0];

}

export async function updateProductName(name, product_id) {

    const query = `UPDATE products 
    SET name = $1 
    WHERE product_id = $2 RETURNING *`;
    const values = [name, product_id];

    const result = await pool.query(query, values);

    return result.rows[0];

}

export async function updateProductStockQuantity(stock_quantity, product_id) {

    const query = `UPDATE products 
    SET stock_quantity = $1 
    WHERE product_id = $2 RETURNING *`;
    const values = [stock_quantity, product_id];

    const result = await pool.query(query, values);

    return result.rows[0];

}

//Raderar en produkt
export async function deleteProduct(id) {

    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);

    // undefined om produkten inte finns
    return result.rows[0];

}