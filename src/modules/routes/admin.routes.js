import { Router } from "express";
import { login, signup } from "../controler/auth.controler.js";

const adminRouter = Router();

adminRouter.post("/signup", signup);
adminRouter.post("/login", login);

export { adminRouter };