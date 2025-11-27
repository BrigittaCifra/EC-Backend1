//En connection pool hanterar databasanslutningar effektivt
//pg-paketet är inte helt esm kompatibelt ännu, så man måste göra en 2 stegs import
import pg from 'pg';
const { Pool } = pg;


//Specificerar connection parametrarna 
export const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});



//connectionString: process.env.DATABASE.env

//import { pool } from 'pg';
