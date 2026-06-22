import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: String, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date }
});

export const AttendanceModel = mongoose.model("Attendance", attendanceSchema);