import { EmployeeModel } from "../models/Employee.model.js";
import { AttendanceModel } from "../models/Attendance.model.js";
import { ErrorHandler, SendError } from "../../services/errorHandeler.js";

function formatLocalTime(date) {
  if (!date) return null;
  const d = new Date(date);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function getWorkingDaysBetween(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  if (current > end) return 0;
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 5) { 
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export const getTodayReport = ErrorHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const nineAM = new Date(`${today}T06:00:00`); 

  const report = await EmployeeModel.aggregate([
    {
      $lookup: {
        from: "attendances",
        let: { empId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$employee", "$$empId"] },
              date: today
            }
          }
        ],
        as: "attendance"
      }
    },
    {
      $addFields: {
        status: {
          $cond: [
            { $eq: [{ $size: "$attendance" }, 0] },
            "absent",
            {
              $cond: [
                { $gt: ["$attendance.checkIn", nineAM] },
                "late",
                "present"
              ]
            }
          ]
        }
      }
    }
  ]);

  const total = report.length;
  const present = report.filter(e => e.status === "present").length;
  const absent = report.filter(e => e.status === "absent").length;
  const late = report.filter(e => e.status === "late").length;
  const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;

  res.status(200).json({
    status: "success",
    date: today,
    summary: {
      totalEmployees: total,
      present: present + late,
      absent: absent,
      onTime: present,
      attendanceRate: `${attendanceRate}%`
    },
    employees: report.map(emp => ({
      id: emp._id,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      checkIn: emp.attendance.length > 0 ? formatLocalTime(emp.attendance[0].checkIn) : null,
      checkOut: emp.attendance.length > 0 ? formatLocalTime(emp.attendance[0].checkOut) : null,
      status: emp.status
    }))
  });
});

export const getAbsentReport = ErrorHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const report = await EmployeeModel.aggregate([
    {
      $lookup: {
        from: "attendances",
        let: { empId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$employee", "$$empId"] },
              date: today
            }
          }
        ],
        as: "attendance"
      }
    },
    {
      $match: {
        $expr: { $eq: [{ $size: "$attendance" }, 0] }
      }
    },
    {
      $project: {
        name: 1,
        employeeId: 1,
        department: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    date: today,
    totalAbsent: report.length,
    employees: report
  });
});

export const getLateReport = ErrorHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const nineAM = new Date(`${today}T06:00:00`); 

  const report = await EmployeeModel.aggregate([
    {
      $lookup: {
        from: "attendances",
        let: { empId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$employee", "$$empId"] },
              date: today,
              checkIn: { $gt: nineAM }
            }
          }
        ],
        as: "attendance"
      }
    },
    {
      $match: {
        "attendance.0": { $exists: true }
      }
    },
    {
      $project: {
        name: 1,
        employeeId: 1,
        department: 1,
        checkIn: { $arrayElemAt: ["$attendance.checkIn", 0] }
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    date: today,
    totalLate: report.length,
    employees: report.map(emp => ({
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      checkIn: emp.checkIn ? formatLocalTime(emp.checkIn) : null
    }))
  });
});

export const getMonthlyReport = ErrorHandler(async (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  let lastDay;
  if (year === currentYear && month === currentMonth) {
    lastDay = currentDay; 
  } else {
    lastDay = new Date(year, month, 0).getDate(); 
  }

  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  let totalWorkingDays = 0;
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); 
    if (dayOfWeek !== 5) { 
      totalWorkingDays++;
    }
  }

  const report = await EmployeeModel.aggregate([
    {
      $lookup: {
        from: "attendances",
        let: { empId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$employee", "$$empId"] },
              date: { $gte: startDate, $lte: endDate }
            }
          }
        ],
        as: "attendances"
      }
    },
    {
      $addFields: {
        totalDays: { $size: "$attendances" }
      }
    },
    {
      $project: {
        name: 1,
        employeeId: 1,
        department: 1,
        createdAt: 1,
        totalDays: 1,
        attendances: 1
      }
    }
  ]);

  const formattedReport = report.map(emp => {
    const registeredAt = new Date(emp.createdAt);
    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);

    const actualStart = registeredAt > periodStart ? registeredAt : periodStart;

    let workingDaysForEmployee = 0;
    const current = new Date(actualStart);
    while (current <= periodEnd) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 5) {
        workingDaysForEmployee++;
      }
      current.setDate(current.getDate() + 1);
    }

    const absentDays = workingDaysForEmployee - emp.totalDays;

    const attendanceRate = emp.totalDays > 0 
      ? ((emp.totalDays / workingDaysForEmployee) * 100).toFixed(1) 
      : 0;

    return {
      _id: emp._id,
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      createdAt: emp.createdAt,
      totalDays: emp.totalDays,
      workingDaysForEmployee,
      absentDays: absentDays > 0 ? absentDays : 0,
      attendanceRate: parseFloat(attendanceRate),
      attendances: emp.attendances.map(att => ({
        date: att.date,
        checkIn: att.checkIn ? formatLocalTime(att.checkIn) : null,
        checkOut: att.checkOut ? formatLocalTime(att.checkOut) : null
      }))
    };
  });

  res.status(200).json({
    status: "success",
    month: `${year}-${String(month).padStart(2, '0')}`,
    totalWorkingDays,
    report: formattedReport
  });
});

export const getEmployeeReport = ErrorHandler(async (req, res) => {
  const { id } = req.params;
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  let lastDay;
  if (year === currentYear && month === currentMonth) {
    lastDay = currentDay;
  } else {
    lastDay = new Date(year, month, 0).getDate();
  }

  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  let totalWorkingDays = 0;
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 5) {
      totalWorkingDays++;
    }
  }

  const employee = await EmployeeModel.findById(id);
  if (!employee) {
    throw new SendError(404, "Employee not found");
  }

  const attendances = await AttendanceModel.find({
    employee: id,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  const totalDays = attendances.length;

  const registeredAt = new Date(employee.createdAt);
  const periodStart = new Date(startDate);
  const periodEnd = new Date(endDate);
  const actualStart = registeredAt > periodStart ? registeredAt : periodStart;

  let workingDaysForEmployee = 0;
  const current = new Date(actualStart);
  while (current <= periodEnd) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 5) {
      workingDaysForEmployee++;
    }
    current.setDate(current.getDate() + 1);
  }

  const absentDays = workingDaysForEmployee - totalDays;
  const attendanceRate = totalDays > 0 ? ((totalDays / workingDaysForEmployee) * 100).toFixed(1) : 0;

  res.status(200).json({
    status: "success",
    employee: {
      id: employee._id,
      name: employee.name,
      employeeId: employee.employeeId,
      department: employee.department,
      createdAt: employee.createdAt 
    },
    period: {
      month: `${year}-${String(month).padStart(2, '0')}`,
      workingDays: totalWorkingDays 
    },
    summary: {
      totalDays: totalDays,
      absentDays: absentDays > 0 ? absentDays : 0,
      attendanceRate: `${attendanceRate}%`
    },
    attendances: attendances.map(att => ({
      date: att.date,
      checkIn: att.checkIn ? formatLocalTime(att.checkIn) : null,
      checkOut: att.checkOut ? formatLocalTime(att.checkOut) : null
    }))
  });
});

export const getEarlyCheckOutReport = ErrorHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const fourPM = new Date(`${today}T16:00:00`);

  const report = await EmployeeModel.aggregate([
    {
      $lookup: {
        from: "attendances",
        let: { empId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$employee", "$$empId"] },
              date: today,
              checkOut: { $lt: fourPM }
            }
          }
        ],
        as: "attendance"
      }
    },
    {
      $match: {
        "attendance.0": { $exists: true }
      }
    },
    {
      $project: {
        name: 1,
        employeeId: 1,
        department: 1,
        checkOut: { $arrayElemAt: ["$attendance.checkOut", 0] }
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    date: today,
    totalEarlyCheckOut: report.length,
    employees: report.map(emp => ({
      name: emp.name,
      employeeId: emp.employeeId,
      department: emp.department,
      checkOut: emp.checkOut ? formatLocalTime(emp.checkOut) : null
    }))
  });
});