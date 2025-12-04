import express from 'express';
const router = express.Router();

import { numValidator, stringValidator, emailValidator, phonenumberValidator } from '../middlewares/validators.js'
import { AppError, ValidationError, NotFoundError } from '../middlewares/errorClasses.js'
import { asyncWrapper } from '../utils/tryCatch.js';
import { getAllCategories, getCategoryByName } from '../repositories/categoriesRepository.js';

//Hämtar alla kategorier
router.get('/', asyncWrapper(async (req, res) => {

    //Inget värde anges bestäms default värden
    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    //Beräknar offset (antal objekt att hoppa över) baserat på sidnumret och gränsen
    //Om man är på sida 1 då vill man inte hoppa över några objekt alls
    const offset = (page - 1) * limit;

    const [totalAmount, result] = await getAllCategories(limit, offset);

    //Guard clause. Throw kommer att avsluta routen tidigt
    //result.rows returnerar [] (tom array) om inget hittas. Därför kollas längden på arrayen
    if (result.length === 0) {
        //skapar en ny error objekt och ändrar error objektets message property
        throw new NotFoundError('No categories found');
    }

    //Skickar tillbaka svar till klienten
    //default statuskoden för res är 200 så här anges inte någon speciell statuskod för responsen
    res.json({
        totalCategories: totalAmount,
        //Här används result.length eftersom det kan hända att det finns färre resultat än
        //vad limit vill begränsa det till. Pga detta behöver denna resultat visas dynamiskts
        categoriesShown: result.length,
        page: page,
        categories: result
    });

}));

//Hämtar kategorier baserat på namn
router.get('/search', asyncWrapper(async (req, res) => {
    const nameSearch = stringValidator(req.query.name, 'name');

    const page = numValidator(req.query.page || 1);
    const limit = numValidator(req.query.limit || 3);

    const offset = (page - 1) * limit;

    const [totalAmount, result] = await getCategoryByName(nameSearch, limit, offset);

    if (result.length === 0) {
        throw new NotFoundError('No categories found matching the search criteria');
    }

    res.json({
        categoriesFound: totalAmount,
        categoriesShown: result.length,
        page: page,
        categories: result
    });

}));


export default router;