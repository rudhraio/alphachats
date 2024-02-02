import express from "express";

import userRouter from "./user/user.route.js";
import chatRouter from "./chats/chats.router.js";
import membersRouter from "./members/members.route.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/chats", chatRouter);
router.use("/members", membersRouter);

export default router;