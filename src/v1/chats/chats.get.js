import express from "express";

import authorizeToken from "../../utils/middlewares/authorize.js";
import logger from "../../utils/helpers/logger.js";
import { notFoundResponse, serverErrorResponse, successResponse } from "../../utils/helpers/response.js";
import { getChatByMembers, getChatsById, getChatsByUser, updateChatInformation } from "../../models/chats.model.js";
import { getMessagesByChatId } from "../../models/message.model.js";
import { sortByCreatedAt } from "../../utils/helpers/sort-filter.js";
import { convertToDynamoFormat } from "../../utils/helpers/dynamo-converter.js";

const chatsGet = express.Router();

chatsGet.get("/", authorizeToken, async (req, res) => {
    try {
        const { userid } = req.query;
        let chat = [], messages = [];
        if (userid) {
            chat = await getChatByMembers(req?.user?.id, userid);
            messages = await getMessagesByChatId(chat.id);
            const temp = chat.usersdetails.map(obj => {
                return {
                    ...obj,
                    unread: req.user.id === obj.id ? "false" : obj?.unread
                };
            });
            console.log("req.user.id", req.user.id);
            console.log("temp", JSON.stringify(temp));

            await updateChatInformation(chat?.id, "usersdetails", { "L": convertToDynamoFormat(temp) });

            messages = sortByCreatedAt(messages, "des");
            chat = { ...chat, messages };
        } else {
            chat = await getChatsByUser(req.user.id);
        }
        return successResponse(res, "chats list", chat);
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
});

chatsGet.get("/:id", authorizeToken, async (req, res) => {
    try {
        const { id } = req.params;
        let chat = await getChatsById(id);
        if (!chat?.id || !chat.userslist.includes(req.user.id)) {
            return notFoundResponse(res, "no chat found");
        };

        const temp = chat.usersdetails.map(obj => {
            return {
                ...obj,
                unread: req.user.id === obj.id ? "false" : obj?.unread
            };
        });
        await updateChatInformation(chat?.id, "usersdetails", { "L": convertToDynamoFormat(temp) });

        let messages = await getMessagesByChatId(chat.id);
        messages = sortByCreatedAt(messages, "des");

        return successResponse(res, "chats list", { ...chat, messages });
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
});

export default chatsGet;