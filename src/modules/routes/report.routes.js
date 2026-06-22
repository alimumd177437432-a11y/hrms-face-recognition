import { Router } from "express";
import {
  getTodayReport,
  getAbsentReport,
  getLateReport,
  getMonthlyReport,
  getEmployeeReport,
  getEarlyCheckOutReport
} from "../controler/report.controler.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const reportRouter = Router();


reportRouter.get("/today", authMiddleware, getTodayReport);

reportRouter.get("/absent", authMiddleware, getAbsentReport);

reportRouter.get("/late", authMiddleware, getLateReport);

reportRouter.get("/monthly", authMiddleware, getMonthlyReport);

reportRouter.get("/employee/:id", authMiddleware, getEmployeeReport);

reportRouter.get("/early-checkout", authMiddleware, getEarlyCheckOutReport); 


export { reportRouter };