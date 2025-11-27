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