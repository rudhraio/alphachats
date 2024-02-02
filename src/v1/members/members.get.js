import express from "express";

import authorizeToken from "../../utils/middlewares/authorize.js";
import logger from "../../utils/helpers/logger.js";
import { serverErrorResponse, successResponse } from "../../utils/helpers/response.js";
import { getAllUsers } from "../../models/user.model.js";

const membersGet = express.Router();

membersGet.get("/", authorizeToken, async (req, res) => {
    try {
        const members = await getAllUsers();

        return successResponse(res, "members list", members);

    } catch (error) {
        logger(`[ERR]: members get: ${error}`);
        return serverErrorResponse(res);
    }
});

export default membersGet;