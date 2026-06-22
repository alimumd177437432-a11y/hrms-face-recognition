import { Router } from "express";
import { adminRouter } from "./modules/routes/admin.routes.js";
import { employeeRouter } from "./modules/routes/employee.routes.js";
import { attendanceRouter } from "./modules/routes/attendance.routes.js";
import { reportRouter } from "./modules/routes/report.routes.js";

const v1Router = Router();

v1Router.use("/admin", adminRouter);
v1Router.use("/employees", employeeRouter); 
v1Router.use("/attendance", attendanceRouter); 
v1Router.use("/reports", reportRouter);  
export { v1Router };