import { numValidator } from "../validators/numberValidator.js";

export function pagination(req, res, next) {
    req.page = numValidator(req.query.page || 1);
    req.limit = numValidator(req.query.limit || 3);
    req.offset = (req.page - 1) * req.limit;
    next();
}