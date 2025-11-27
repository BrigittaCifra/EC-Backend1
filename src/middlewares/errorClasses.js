//Instead of generic error objects, a structured approach with custom error classes helps differentiate errors and improves debugging
export class AppError extends Error {
    constructor(message, statusCode, details) {
        super(message); // Anropar Error's constructor genom 'super'
        this.statusCode = statusCode; // Lägger till en HTTP statuskod
        this.details = details; // Lägger till valideringsdetaljer
    }

    //static används här för att alla DbErrorCode instanser
    //ska kunna dela på enumet (dvs säga att enumet ska inte
    //finnas per objekt, utan per klass)
    static DbErrorCode = Object.freeze({
        FOREIGN_KEY_VIOLATION: { code: '23503', message: 'Insert or update on table violates foreign key constraint' },
        UNIQUE_VIOLATION: { code: '23505', message: 'duplicate key value violates unique constraint' },
        NOT_NULL_VIOLATION: { code: '23502', message: 'null value violates not-null constraint' },
        CHECK_VIOLATION: { code: '23514', message: 'New row for relation violates check constraint' }
    });

}

export class ValidationError extends AppError {

    constructor(message, details) {

        /*Anropar AppError's constructor genom super() och hårdkodar statuskoden.
        AppErrors constructor körs inte automatiskt. Så om man vill skicka med argument 
        till AppErrors constructor måste man definera de egenskaperna genom super()*/
        super(message, 400, details);
    }

}

//Lägga till databasstatuskoder här som enums?
//23503 Foreign key constraint violation
//23502 Not null constraint violation

export class AuthError extends AppError {
    constructor(message, details) {

        super(message, 401, details);

    }
}

export class NotFoundError extends AppError {
    constructor(message, details) {

        super(message, 404, details);


    }
}