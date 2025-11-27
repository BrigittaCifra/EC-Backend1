//A middleware function always takesreq, res, next
//Därför behöver vi returnera en funktion
export function paginatedResults(route) {

    //Fungerar som en middleware
    const test = (req, res, next) => {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const offset = (page - 1) * limit;


        //setting the paginated results to our result
        //variable. Så att vi kan använda den i responsen
        res.paginatedResults = results

        //Går tillbaka till routen
        next()
    }

}