import logger from "../helpers/logger.js";
import { verifyToken } from "../helpers/auth.js";
import { serverErrorResponse, unauthorizedResponse } from "../helpers/response.js";


export default function authorizeToken(req, res, next) {
    try {
        const token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            return unauthorizedResponse(res, "Unauthorized: No token provided");
        }

        const decoded = verifyToken(token.substring(7));
        if (!decoded) {
            return unauthorizedResponse(res, "Unauthorized: No token provided");
        }
        delete decoded.exp;
        delete decoded.iat;

        req.user = decoded;

        next();
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
}