import { Router } from "express";
import { scanAttendance } from "../controler/attendance.controler.js";
import { upload } from "../../services/multer.service.js";

const attendanceRouter = Router();

attendanceRouter.post("/scan", upload.single("image"), scanAttendance);

export { attendanceRouter };