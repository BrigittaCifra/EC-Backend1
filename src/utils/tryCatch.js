//Arrow funktion. Tar emot en route handler som argument.
//Detta gör myAsyncFunktion dynamisk
export const asyncWrapper = (route) => {

    //Här skapas en ny async funktion som wrappar den ursprungliga routen.
    //myAsyncFunction erbjuder en återanvändbar try-catch struktur.
    //(req, res, next) måste finnas för att Express ska kunna anropa myAsyncFunction korrekt
    const myAsyncFunction = async (req, res, next) => {
        try {

            //Här körs routen som skickas med i (route) parametern.
            //Här finns (req, res, next) återigen, men den här gången för att
            //faktiskt kunna använda (req, res, next) 
            await route(req, res, next);

            //Om något går fel skickas det till catch blocken
        } catch (error) {

            //next skickar feletvidare till error handlern
            next(error);

        }
    };

    //returnerar den asyncrona funktionen
    return myAsyncFunction;

};