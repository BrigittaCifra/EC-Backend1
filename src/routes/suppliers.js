import express from 'express';
const router = express.Router();

import { numValidator, stringValidator, emailValidator, phonenumberValidator } from '../middlewares/validators.js';
import { AppError, ValidationError, NotFoundError } from '../middlewares/errorClasses.js';
import { asyncWrapper } from '../utils/tryCatch.js';
import {
    getAllSuppliers,
    getSupplierByName,
    getSupplierByIDProductCount,
    createSupplier,
    updateSupplier,
    updateSupplierName,
    updateSupplierCountry,
    deleteSupplier,
    getAllProductsFromSupplier
} from '../repositories/suppliersRepository.js';

//Hämtar alla leverantörer
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.get('/', asyncWrapper(async (req, res, next) => {

    //Om inget värde anges bestäms default värden
    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    //Beräknar offset (antal objekt att hoppa över) baserat på sidnumret och gränsen
    //Om man är på sida 1 då vill man inte hoppa över några objekt alls
    const offset = (page - 1) * limit;

    //Anropar databas query funktionen
    const [totalAmount, result] = await getAllSuppliers(limit, offset);


    //Guard clause. Throw kommer att avsluta routen tidigt
    if (result.length === 0) {
        //skapar en ny error objekt och ändrar error objektets message property
        throw new NotFoundError('Inga leverantörer hittades');
    }

    //Skickar tillbaka svar till klienten
    res.json({
        totalSuppliers: totalAmount,
        //Här används result.length eftersom det kan hända att det finns färre resultat än
        //vad limit vill begränsa det till. Pga detta behöver denna resultat visas dynamiskt 
        suppliersShown: result.length,
        page: page,
        suppliers: result
    });

}));

router.get('/search', asyncWrapper(async (req, res, next) => {

    const nameSearch = stringValidator(req.query.name, 'name');

    //Om inget värde anges bestäms default värden
    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    const offset = (page - 1) * limit;

    const [totalAmount, result] = await getSupplierByName(nameSearch, limit, offset);

    if (result.length === 0) {
        throw new NotFoundError('Inga leverantörer hittades');
    }

    res.json({
        totalSuppliers: totalAmount,
        suppliersShown: result.length,
        page: page,
        suppliers: result
    });

}));

//Hämtar alla leverantörer + antal produkter de har
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.get('/:id', asyncWrapper(async (req, res, next) => {
    //Omvandlar inputen från användaren till heltal
    const id = numValidator(req.params.id, 'id');
    //Anropar databas query funktionen
    const result = await getSupplierByIDProductCount(id);

    //Kastar error om leverantören med det angivna id:t inte finns
    if (!result) {
        throw new NotFoundError('ingen leverantör hittades med id:t ' + id);
    }

    //Skickar tillbaka svar till klienten
    res.json(result);

}));

//skapa en ny leverantör
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.post('/', asyncWrapper(async (req, res, next) => {
    const { name, contact_person_firstname, contact_person_secondname, email, phonenumber, country } = req.body;

    //Validerar alla fällt
    stringValidator(name, 'name');
    stringValidator(contact_person_firstname, 'contact_person_firstname');
    stringValidator(contact_person_secondname, 'contact_person_secondname');
    emailValidator(email, 'email');
    phonenumberValidator(phonenumber, 'phonenumber');
    stringValidator(country, 'country');

    //validera att leverantören har ett unikt namn genom databas constraints

    const result = await createSupplier(name, contact_person_firstname, contact_person_secondname, email, phonenumber, country);

    res.status(201).json(result);

}));

//uppdaterar en hel leverantör
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.put('/:id', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');
    const { name, contact_person_firstname, contact_person_secondname, email, phonenumber, country } = req.body;

    // Validerar alla fällt
    stringValidator(name, 'name');
    stringValidator(contact_person_firstname, 'contact_person_firstname');
    stringValidator(contact_person_secondname, 'contact_person_secondname');
    emailValidator(email, 'email');
    phonenumberValidator(phonenumber, 'phonenumber');
    stringValidator(country, 'country');

    const result = await updateSupplier(name, contact_person_firstname, contact_person_secondname, email, phonenumber, country, id);

    if (!result) {
        throw new NotFoundError('Leverantören hittades inte');
    }

    res.json(result);

}));

//uppdaterar endast namnet på en leverantör
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.patch('/:id/name', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');
    const name = stringValidator(req.body.name, 'name');

    const result = await updateSupplierName(name, id);

    if (!result) {
        throw new NotFoundError('Leverantören hittades inte');
    }

    res.json(result);

}));

//uppdaterar endast landet för en leverantör
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.patch('/:id/country', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');
    const country = stringValidator(req.body.country, 'country');

    const result = await updateSupplierCountry(country, id);

    if (!result) {
        throw new NotFoundError('Leverantören hittades inte');
    }

    res.json(result);

}));


//ta bort en leverantör
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.delete('/:id', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');
    const result = await deleteSupplier(id);

    //pool.query() returnerar alltid ett resultatobjekt, även för DELETE. Resultatobjektet 
    // innehåller bland annat rowCount och rows
    if (!result) {
        throw new NotFoundError('Inga leverantörer hittades med id:t ' + id);
    }

    res.status(204).send();

}));

//hämta alla produkter från en specifik leverantör
//OBS!! try catch delen av koden hanteras av asyncWrapper funktionen
router.get('/:id/products', asyncWrapper(async (req, res, next) => {
    const id = numValidator(req.params.id, 'id');

    //Om inget värde anges bestäms default värden
    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    const offset = (page - 1) * limit;

    const [totalAmount, supplierName, result] = await getAllProductsFromSupplier(id, limit, offset);

    if (result.length === 0) {
        throw new NotFoundError('Inga produkter hittades för leverantören');
    }

    //Skickar tillbaka svar till klienten
    res.json({
        supplier: supplierName,
        totalProducts: totalAmount,
        productsShown: result.length,
        page: page,
        products: result
    });

}));

export default router;