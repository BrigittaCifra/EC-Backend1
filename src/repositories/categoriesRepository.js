//Importerar databas anslutningen
import { pool } from '../config/db.js';

//Hämtar alla kategorier
export async function getAllCategories(limit, offset) {

    const result = await pool.query(`SELECT *, 
        COUNT(*) OVER() AS full_count
        FROM categories 
        ORDER BY category_id 
        LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    const totalAmount = parseInt(result.rows[0].full_count);

    // Tar bort full_count från result variablernas rader. Detta
    //för att ha en variabel med total antal och en med själva datan
    for (let rows of result.rows) {

        //loopar igenom varje objekt i result.rows arrayen
        //delete tar bort en egenskap från ett objekt
        delete rows.full_count
        delete rows.category_id
        delete rows.supplier_id
    }

    //totalAmount kommer att innehålla det totala antalet produkter
    //result.rows kommer att returnera själva datan/innehållet
    return [totalAmount, result.rows];
}

export async function getCategoryByName(name, limit, offset) {

    //LOWER(name) konverterar kategori namnet i databasen
    //wildcard karaktärerna % matchar alla tecken före och efter söksträngen
    //name.toLowerCase() konverterar söksträngen så att sökningen inte blir case sensitive
    const result = await pool.query(`SELECT categories.*,
        count(*) OVER() AS full_count  
        FROM categories 
        WHERE LOWER(categories.name) LIKE $1
        LIMIT $2 OFFSET $3`,
        ['%' + name.toLowerCase() + '%', limit, offset]
    );

    const totalAmount = parseInt(result.rows[0].full_count);

    for (let rows of result.rows) {
        delete rows.full_count
    }

    return [totalAmount, result.rows];
}