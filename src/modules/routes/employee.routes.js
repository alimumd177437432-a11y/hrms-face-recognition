import { Router } from "express";

import { upload } from "../../services/multer.service.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { deleteEmployee, getAllEmployees, registerEmployee, searchEmployees, updateEmployee } from "../controler/employee.controller.js";

const employeeRouter = Router();


employeeRouter.post("/register", authMiddleware, upload.single("image"), registerEmployee);

employeeRouter.get("/", authMiddleware, getAllEmployees);

employeeRouter.get("/search", authMiddleware, searchEmployees);

employeeRouter.put("/:id", authMiddleware, updateEmployee);

employeeRouter.delete("/:id", authMiddleware, deleteEmployee);

export { employeeRouter };