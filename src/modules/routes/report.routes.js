import { Router } from "express";
import {
  getTodayReport,
  getAbsentReport,
  getLateReport,
  getMonthlyReport,
  getEmployeeReport,
  getEarlyCheckOutReport
} from "../controler/report.controler.js";
import { monthlyReportValidation } from "../validations/report.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";

const reportRouter = Router();

reportRouter.get("/today", authMiddleware, getTodayReport);
reportRouter.get("/absent", authMiddleware, getAbsentReport);
reportRouter.get("/late", authMiddleware, getLateReport);
reportRouter.get("/early-checkout", authMiddleware, getEarlyCheckOutReport);

reportRouter.get(
  "/monthly",
  authMiddleware,
  validate(monthlyReportValidation, 'query'),
  getMonthlyReport
);

reportRouter.get("/employee/:id", authMiddleware, getEmployeeReport);

export { reportRouter };