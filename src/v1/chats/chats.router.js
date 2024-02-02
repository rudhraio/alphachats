import express from "express";

import chatsGet from "./chats.get.js";
import chatsPost from "./chats.post.js";

const chatRouter = express.Router();

chatRouter.use("/get", chatsGet);
chatRouter.use("/post", chatsPost);


export default chatRouter;