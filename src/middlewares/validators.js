import { AppError, ValidationError, NotFoundError } from './errorClasses.js'

export function numValidator(num, param) {

    //Parsar numret
    num = parseInt(num);

    //Om det inte finns ett angivet värde
    //The check !num will fail for valid numeric values like 0
    if (num === undefined || num === null) {

        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: param + ' är inte iffyld' }
        );

    }

    //Om datatypen är fel
    //Number.isNaN() är mer pålitlig än isNaN()
    if (Number.isNaN(num)) {

        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: num + ' är inte ett nummer' }
        );

    }

    //Skickar tillbaka numret
    return num;

}

export function stringValidator(str, param) {
    // Allows letters (including å, ä, ö, Å, Ä, Ö), spaces, and hyphens
    const regex = /^[A-Za-zÅÄÖåäö\s\-]+$/;

    //Om datatypen är fel
    if (typeof str !== "string") {

        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: str + ' är inte en sträng' }
        );

    };

    //Om det inte finns ett angivet värde
    //eller om inputen är blank
    if (!str || str.trim().length === 0) {

        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: param + ' är inte iffyld' }
        );

    };

    if (!regex.test(str)) {

        throw new ValidationError(
            'Ogilting sträng',
            { Parameter: param, Anledning: param + ' måste innehålla tecken mellan a-z' }
        );

    };

    //Skickar tillbaka strängen
    return str;

};

export function emailValidator(email, param) {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Kontrollera datatypen först
    if (typeof email !== 'string') {
        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: param + ' ska skrivas som en sträng' }
        );
    }

    //Om det inte finns ett angivet värde
    if (!email || email.trim().length === 0) {
        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: param + ' är inte iffyld' }
        );
    };

    //Kollar om mejlet matchar regex
    //The test() method of RegExp instances executes a search with this regular expression 
    // for a match between a regular expression and a specified string. Returns true if there is a match; false otherwise.
    if (!regex.test(email)) {
        throw new ValidationError(
            'Ogiltig e-post format',
            { Parameter: param }
        );
    };

    return email;

};

export function phonenumberValidator(phonenumber, param) {

    const regex = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/

    if (typeof phonenumber !== 'string') {

        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: param + ' ska skrivas som en sträng' }
        );

    };

    if (!phonenumber || phonenumber.trim().length === 0) {
        throw new ValidationError(
            'Param validering misslyckad',
            { Parameter: param, Anledning: param + ' är inte iffyld' }
        );
    };

    if (!regex.test(phonenumber)) {
        throw new ValidationError(
            'Ogiltig telefonnummer format',
            { Parameter: param }
        );
    }

    return phonenumber;

};

//Kolla upp pagination


//const { AppError, ValidationError, NotFoundError } = require('./errorClasses');

//module.exports = { numValidator, stringValidator, emailValidator, phonenumberValidator };