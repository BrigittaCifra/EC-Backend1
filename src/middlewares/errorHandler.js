//Error handler. Express känner igen detta som en
import { AppError } from "./errorClasses.js";

//error handler endast om den har exakt 4 parametrar
export const errorHandler = (err, req, res, next) => {

    //Läser från error objektet som skickades in.
    //bestämmer statuskod baserat på felet
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    //Speciell hantering för databasfel
    //Pg error objekt har en 'code' egenskap
    if (err.code) {

        //Object.values() returnerar en array med alla värden i ett objekt
        //find() går igenom varje värde i arrayen
        //e är varje värde i arrayen
        //Returnerar true om koden matchar appError klassens DbErrorCode code egenskap (ett enum)
        const matchedError = Object.values(AppError.DbErrorCode).find(e => e.code === err.code) || { message: 'Okänt databasfel' };

        console.error('Databasfel:', {
            pgCode: err.code,
            pgMessage: err.message,
            constraint: err.constraint,
            detail: err.detail,
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        return res.status(statusCode).json({
            statusCode: statusCode,
            errorCode: err.code,
            message: matchedError.message
        });

    };


    // Logga felet för debugging
    console.error('Ett fel upptodd:', {
        message: message,
        statusCode: statusCode,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Skicka response (samma struktur för alla fel)
    res.status(statusCode).json({
        statusCode: statusCode,
        message: message,
        details: err.details || undefined
    });


};
