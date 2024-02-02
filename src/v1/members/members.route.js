import express from "express";

import membersGet from "./members.get.js";


const membersRouter = express.Router();

membersRouter.use("/get", membersGet);

export default membersRouter;