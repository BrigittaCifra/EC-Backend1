//OBS!!! Projektet använder ESM modulen utan .mjs filendelsen eftersom
//jag ändrade 'type' till 'module' i package.json och då behöver man
//inte .mjs filendelsen 
import 'dotenv/config'; //process.env innehåller env variablerna
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import rateLimit from "express-rate-limit";
import productRouter from './routes/products.js';
import suppliersRouter from './routes/suppliers.js';
import categoriesRouter from './routes/categories.js';
//import { parse } from 'dotenv';


//Implementing rate limiting ensures the server remains responsive under heavy load
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { status: "error", message: "För många request. Testa igen senare" },
});


const app = express();
app.use(express.json());
app.use(limiter);


// Routers
app.use('/products', productRouter);
app.use('/suppliers', suppliersRouter);
app.use('/categories', categoriesRouter);


// Error handler
app.use(errorHandler);


// Server start
const PORT = process.env.APP_PORT;
const HOST = process.env.DB_HOST;
app.listen(PORT, HOST, () => {
    console.log(`The server is running at http://${HOST}:${PORT}`);
});

console.log('The server is now stopped');