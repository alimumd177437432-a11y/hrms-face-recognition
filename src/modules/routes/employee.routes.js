import { Router } from "express";
import { 
  registerEmployee, 
  getAllEmployees,
  deleteEmployee,
  updateEmployee,
  searchEmployees
} from "../controler/employee.controller.js";
import { upload } from "../../services/multer.service.js";
import { registerEmployeeValidation, updateEmployeeValidation } from "../validations/employee.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";


const employeeRouter = Router();
employeeRouter.post(
  "/register",
  authMiddleware,
  upload.single("image"),
  validate(registerEmployeeValidation),
  registerEmployee
);

employeeRouter.put(
  "/:id",
  authMiddleware,
  validate(updateEmployeeValidation),
  updateEmployee
);

employeeRouter.get("/", authMiddleware, getAllEmployees);
employeeRouter.get("/search", authMiddleware, searchEmployees);
employeeRouter.delete("/:id", authMiddleware, deleteEmployee);

export { employeeRouter };