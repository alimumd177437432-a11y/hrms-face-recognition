import { EmployeeModel } from "../models/Employee.model.js";
import { getFaceDescriptor } from "../../utils/face-config.js";
import { ErrorHandler, SendError } from "../../services/errorHandeler.js";
import { AttendanceModel } from "../models/Attendance.model.js";

export const registerEmployee = ErrorHandler(async (req, res) => {
  const { name, employeeId, department } = req.body;

  const existing = await EmployeeModel.findOne({ employeeId });
  if (existing) {
    throw new SendError(409, "Employee already exists");
  }

  if (!req.file) {
    throw new SendError(400, "Face image is required");
  }

  const faceDescriptor = await getFaceDescriptor(req.file.buffer);
  if (!faceDescriptor) {
    throw new SendError(400, "No face detected in the image");
  }

  const employee = await EmployeeModel.create({
    name,
    employeeId,
    department,
    faceDescriptor,
  });

  res.status(201).json({
    status: "success",
    message: "Employee registered successfully",
    data: {
      id: employee._id,
      name: employee.name,
      employeeId: employee.employeeId,
      department: employee.department,
    },
  });
});

export const getAllEmployees = ErrorHandler(async (req, res) => {
  const employees = await EmployeeModel.find({}, { faceDescriptor: 0 });
  res.status(200).json({
    status: "success",
    data: employees,
  });
});

export const deleteEmployee = ErrorHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await EmployeeModel.findByIdAndDelete(id);
  if (!employee) {
    throw new SendError(404, "Employee not found");
  }

  await AttendanceModel.deleteMany({ employee: id });

  res.status(200).json({
    status: "success",
    message: "Employee deleted successfully",
  });
});

export const updateEmployee = ErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { name, department } = req.body;

  const employee = await EmployeeModel.findById(id);
  if (!employee) {
    throw new SendError(404, "Employee not found");
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (department) updateData.department = department;

  if (Object.keys(updateData).length === 0) {
    throw new SendError(400, "No data to update");
  }

  const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true },
  ).select("-faceDescriptor");

  res.status(200).json({
    status: "success",
    message: "Employee updated successfully",
    data: updatedEmployee,
  });
});

export const searchEmployees = ErrorHandler(async (req, res) => {
  const { name, employeeId, department } = req.query;

  const searchCriteria = {};

  if (name) {
    searchCriteria.name = { $regex: name, $options: "i" };
  }

  if (employeeId) {
    searchCriteria.employeeId = employeeId;
  }

  if (department) {
    searchCriteria.department = { $regex: department, $options: "i" };
  }

  const employees = await EmployeeModel.find(searchCriteria, {
    faceDescriptor: 0,
  });

  res.status(200).json({
    status: "success",
    count: employees.length,
    data: employees,
  });
});
