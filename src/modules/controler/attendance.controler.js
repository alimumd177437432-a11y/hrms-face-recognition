import { EmployeeModel } from "../models/Employee.model.js";
import { AttendanceModel } from "../models/Attendance.model.js";
import { getFaceDescriptor } from "../../utils/face-config.js";
import { ErrorHandler, SendError } from "../../services/errorHandeler.js";

const THRESHOLD = 0.6;
const OFFSET_HOURS = 3; 

const getPalestineTime = () => {
  const now = new Date();
  return new Date(now.getTime() + (OFFSET_HOURS * 60 * 60 * 1000));
};

export const scanAttendance = ErrorHandler(async (req, res) => {
  if (!req.file) {
    throw new SendError(400, "Image is required");
  }

  const currentDescriptor = await getFaceDescriptor(req.file.buffer);
  if (!currentDescriptor) {
    throw new SendError(400, "No face detected in the image. Please try again.");
  }

  const employees = await EmployeeModel.find();
  if (employees.length === 0) {
    throw new SendError(404, "No employees registered in the system");
  }

  let matchedEmployee = null;
  let bestMatchDistance = Infinity;

  for (const employee of employees) {
    let distance = 0;
    for (let i = 0; i < currentDescriptor.length; i++) {
      distance += Math.pow(currentDescriptor[i] - employee.faceDescriptor[i], 2);
    }
    distance = Math.sqrt(distance);

    if (distance < THRESHOLD && distance < bestMatchDistance) {
      bestMatchDistance = distance;
      matchedEmployee = employee;
    }
  }

  if (!matchedEmployee || bestMatchDistance >= THRESHOLD) {
    throw new SendError(404, "Face not recognized. Please contact HR.");
  }

  const palestineNow = getPalestineTime();
  const today = palestineNow.toISOString().split('T')[0];
  
  const timeString = palestineNow.toISOString().split('T')[1].split('.')[0];

  let attendance = await AttendanceModel.findOne({
    employee: matchedEmployee._id,
    date: today
  });

  if (!attendance) {
    attendance = await AttendanceModel.create({
      employee: matchedEmployee._id,
      date: today,
      checkIn: palestineNow, 
      checkOut: null
    });

    return res.status(200).json({
      status: "success",
      message: `Welcome ${matchedEmployee.name}! Check-in recorded at ${timeString}`,
      data: {
        employee: matchedEmployee.name,
        employeeId: matchedEmployee.employeeId,
        action: "check-in",
        time: timeString, 
        confidence: (1 - bestMatchDistance).toFixed(3)
      }
    });
  } 
  
  else if (attendance.checkIn && !attendance.checkOut) {
    attendance.checkOut = palestineNow;
    await attendance.save();

    return res.status(200).json({
      status: "success",
      message: `Goodbye ${matchedEmployee.name}! Check-out recorded at ${timeString}`,
      data: {
        employee: matchedEmployee.name,
        employeeId: matchedEmployee.employeeId,
        action: "check-out",
        time: timeString,
        confidence: (1 - bestMatchDistance).toFixed(3)
      }
    });
  } 
  
  else {
    throw new SendError(400, `Already checked in and out today, ${matchedEmployee.name}`);
  }
});