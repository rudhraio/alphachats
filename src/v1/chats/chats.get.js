import express from "express";

import authorizeToken from "../../utils/middlewares/authorize.js";
import logger from "../../utils/helpers/logger.js";
import { notFoundResponse, serverErrorResponse, successResponse } from "../../utils/helpers/response.js";
import { getChatsById, getChatsByUser } from "../../models/chats.model.js";
import { getMessagesByChatId } from "../../models/message.model.js";

const chatsGet = express.Router();

chatsGet.get("/", authorizeToken, async (req, res) => {
    try {
        const chat = await getChatsByUser(req.user.id);
        return successResponse(res, "chats list", { ...req.user, chat });
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
});

chatsGet.get("/:id", authorizeToken, async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await getChatsById(id);
        if (!chat?.id) {
            return notFoundResponse(res, "no chat found");
        };

        const messages = await getMessagesByChatId(chat.id);

        return successResponse(res, "chats list", { ...chat, messages });
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
});

export default chatsGet;