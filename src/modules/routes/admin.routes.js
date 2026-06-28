import { Router } from "express";
import { login, signup } from "../controler/auth.controler.js";
import { loginValidation, signupValidation } from "../validations/auth.validation.js";
import { validate } from "../../middlewares/validation.middleware.js";

const adminRouter = Router();

adminRouter.post("/signup", validate(signupValidation), signup);
adminRouter.post("/login", validate(loginValidation), login);

export { adminRouter };