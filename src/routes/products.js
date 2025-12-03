import express from 'express';
const router = express.Router();

import { numValidator, stringValidator, emailValidator, phonenumberValidator } from '../middlewares/validators.js'
import { AppError, ValidationError, NotFoundError } from '../middlewares/errorClasses.js'
import { asyncWrapper } from '../utils/tryCatch.js';
import {
    getAllProducts,
    getProductById,
    getProductByName,
    createProduct,
    updateProduct,
    updateProductName,
    updateProductStockQuantity,
    deleteProduct
} from '../repositories/productsRepository.js';

//Hämtar all produkter
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.get('/', asyncWrapper(async (req, res, next) => {

    //Inget värde anges bestäms default värden
    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    //Beräknar offset (antal objekt att hoppa över) baserat på sidnumret och gränsen
    //Om man är på sida 1 då vill man inte hoppa över några objekt alls
    const offset = (page - 1) * limit;

    //Anropar databas query funktionen
    const [totalAmount, result] = await getAllProducts(limit, offset);

    //Guard clause. Throw kommer att avsluta routen tidigt
    //result.rows returnerar [] (tom array) om inget hittas. Därför kollas längden på arrayen
    if (result.length === 0) {
        //skapar en ny error objekt och ändrar error objektets message property
        throw new NotFoundError('Inga produkter hittades');
    }

    //Skickar tillbaka svar till klienten
    //default statuskoden för res är 200 så här anges inte någon speciell statuskod för responsen
    res.json({
        totalProducts: totalAmount,
        //Här används result.length eftersom det kan hända att det finns färre resultat än
        //vad limit vill begränsa det till. Pga detta behöver denna resultat visas dynamiskts
        productsShown: result.length,
        page: page,
        products: result
    });

}));


//Hämtar produkter baserat på titel
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.get('/search', asyncWrapper(async (req, res, next) => {
    const nameSearch = stringValidator(req.query.name, 'name');

    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    const offset = (page - 1) * limit;

    const [totalAmount, result] = await getProductByName(nameSearch, limit, offset);


    if (result.length === 0) {
        throw new NotFoundError('Inga produkter hittades');
    }

    res.json({
        productsFound: totalAmount,
        productsShown: result.length,
        page: page,
        products: result
    });

}));

//Hämtar en specifik produkt
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.get('/:id', asyncWrapper(async (req, res, next) => {
    //Omvandlar inputen från användaren till heltaloch och validerar samitigt inputen genom numValidator
    const id = numValidator(req.params.id, 'id');
    //Anropar databas query funktionen
    const result = await getProductById(id);

    //result.rows[0] returnerar undefined om inga produkter hittas därför används
    //!result här för att kolla om det är falsy och inte result.length === 0
    if (!result) {
        throw new NotFoundError('Produkten hittades inte');
    }

    res.json(result);

}));

//Skapar en ny product
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.post('/', asyncWrapper(async (req, res, next) => {
    const { name, stock_quantity, price, category_id, supplier_id } = req.body;

    //Validerar alla fällt
    stringValidator(name, 'name');
    numValidator(stock_quantity, 'stock_quantity');
    numValidator(price, 'price');
    numValidator(category_id, 'category_id');
    numValidator(supplier_id, 'supplier_id');

    const result = await createProduct(name, stock_quantity, price, category_id, supplier_id);

    res.status(201).json(result);

}));

//Uppdaterar en hel produkt
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.put('/:id', asyncWrapper(async (req, res, next) => {
    //Omvandlar inputen från användaren till heltal
    const id = numValidator(req.params.id, 'id');
    const { name, stock_quantity, price, category_id, supplier_id } = req.body;

    //Validerar alla fällt
    stringValidator(name, 'name');
    numValidator(stock_quantity, 'stock_quantity');
    numValidator(price, 'price');
    numValidator(category_id, 'category_id');
    numValidator(supplier_id, 'supplier_id');

    const result = await updateProduct(name, stock_quantity, price, category_id, supplier_id, id);

    if (!result) {
        throw new NotFoundError('Produkten hittades inte');
    }

    res.json(result);

}));

//Uppdaterar endast namnet på en produkt
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.patch('/:id/name', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');
    const name = stringValidator(req.body.name, 'name');

    const result = await updateProductName(name, id);

    if (!result) {
        throw new NotFoundError('Produkten hittades inte');
    }

    res.json(result);
}));

//Uppdaterar endast stock_quantity för en produkt
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.patch('/:id/stock_quantity', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');
    const stock_quantity = numValidator(req.body.stock_quantity, 'stock_quantity');

    const result = await updateProductStockQuantity(stock_quantity, id);

    if (!result) {
        throw new NotFoundError('Produkten hittades inte');
    }

    res.json(result);
}));

//Tar bort en produkt
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.delete('/:id', asyncWrapper(async (req, res, next) => {
    //Omvandlar inputen från användaren till heltal
    const id = numValidator(req.params.id, 'id');

    const result = await deleteProduct(id);

    //pool.query() returnerar alltid ett resultatobjekt, även för DELETE. Resultatobjektet 
    // innehåller bland annat rowCount och rows
    if (!result) {
        throw new NotFoundError('Inga produkter hittades med id:t ' + id);
    }

    res.status(204).send();

}));


export default router;