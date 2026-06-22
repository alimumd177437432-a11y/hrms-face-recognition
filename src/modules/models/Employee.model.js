import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  faceDescriptor: { type: [Number], required: true } 
}, { timestamps: true });

export const EmployeeModel = mongoose.model("Employee", employeeSchema);