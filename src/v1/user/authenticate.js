import express from "express";
import { body } from "express-validator";


import validator from '../../utils/middlewares/validator.js';
import logger from "../../utils/helpers/logger.js";
import { serverErrorResponse, successResponse } from "../../utils/helpers/response.js";
import { createUser, getByUsername } from "../../models/user.model.js";
import { generateTokens } from "../../utils/helpers/auth.js";

const authenticateRouter = express.Router();

const validData = [
    body("username").trim().notEmpty().withMessage("username is mandatory"),
]

authenticateRouter.post("/", validator(validData), async (req, res) => {
    try {

        const { username } = req.body;

        let user = await getByUsername(username);

        if (!user?.id) {
            user = await createUser({ username });
        } else {
            user = {
                id: user.id.S,
                username: user.username.S,
                fullname: user.fullname.S,
                image: user.image.S,
                utype: user.utype.S,
                ugroup: user.ugroup.S
            }
        }

        const tokenInfo = {
            id: user.id,
            fullname: user.fullname,
            image: user.image,
            username: user.username,
            utype: user.utype,
            ugroup: user.ugroup
        }

        const { accessToken, refreshToken } = generateTokens(tokenInfo);

        return successResponse(res, "user login successfull", { ...tokenInfo, accessToken, refreshToken });
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
})

export default authenticateRouter;