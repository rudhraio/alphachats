import express from "express";

import validator from "../../utils/middlewares/validator.js";
import authorizeToken from "../../utils/middlewares/authorize.js";
import logger from "../../utils/helpers/logger.js";
import { notFoundResponse, serverErrorResponse, successResponse } from "../../utils/helpers/response.js";
import { createChat, getChatByMembers, getChatsById, updateChatInformation } from "../../models/chats.model.js";
import { body } from "express-validator";
import { getByUserId, getByUsername } from "../../models/user.model.js";
import { createMessage } from "../../models/message.model.js";
import { boradcastMessage } from "../../wss/socket.js";
import { convertToDynamoFormat } from "../../utils/helpers/dynamo-converter.js";

const chatsPost = express.Router();

const validData = [
    body("to").notEmpty().withMessage("to is mandatory"),
    body("message").optional().isString().withMessage("invalid message sent").notEmpty().withMessage("message can't be empty"),
    body("mtype").optional().isString().withMessage("invalid message type sent").isIn(['text', 'attachment', 'json']).withMessage("message type is invalid, only text, attachment, json"),
    body("ctype").optional().isString().withMessage("invalid chat type sent").isIn(['one-to-one', 'group']).withMessage("chat type is invalid, only one-to-one, group"),
    body("attachment").optional().isArray().withMessage("invalid attachment type")
]

chatsPost.post("/", authorizeToken, validator(validData), async (req, res) => {
    try {
        const {
            to,
            message = "new message",
            mtype = "text",
            ctype = "one-to-one",
            attachment = [],
        } = req.body;

        let chat = {};

        if (ctype === "one-to-one") {
            const touser = await getByUserId(to);
            if (!touser?.id) {
                return notFoundResponse(res, "No user found");
            }
            chat = await getChatByMembers(req?.user?.id, touser?.id);
            if (!chat?.id) {
                const usersdetails = [
                    {
                        id: req?.user?.id,
                        fullname: req?.user?.fullname,
                        username: req.user.username,
                        image: req.user.image
                    },
                    {
                        id: touser?.id,
                        fullname: touser?.fullname,
                        username: touser?.username,
                        image: touser?.image
                    }
                ]
                chat = await createChat({ userslist: [req?.user?.id, touser?.id], usersdetails, message });
            }
        } else {
            chat = await getChatsById(to);
        }

        if (!chat?.id) {
            return notFoundResponse(res, "no matching chat found");
        }

        await createMessage({ chatid: chat?.id, from: req.user.id, message, mtype, attachment });
        await updateChatInformation(chat?.id, "last_message", { "S": message });

        const temp = chat.usersdetails.map(obj => {
            return {
                ...obj,
                unread: req.user.id === obj.id ? "false" : "true"
            };
        });
        await updateChatInformation(chat?.id, "usersdetails", { "L": convertToDynamoFormat(temp) });


        // await updateChatInformation(chat?.id, "unread", { "S": "true" });
        try {
            await boradcastMessage([to, req.user.id], req.user.id, { message, mtype, attachment }, "message");
        } catch (err) {
            logger(`[ERR]: ${err}`, true);
        }

        return successResponse(res, "message sent successfully");
    } catch (error) {
        logger(`[ERR]: ${error}`, true);
        return serverErrorResponse(res);
    }
})

export default chatsPost;