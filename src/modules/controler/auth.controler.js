import { AdminModel } from "../models/Admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import { ErrorHandler, SendError } from "../../services/errorHandeler.js";

export const signup = ErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingAdmin = await AdminModel.findOne({ email });
  if (existingAdmin) {
    throw new SendError(409, "Admin already exists");
  }

  const hashedPassword = bcrypt.hashSync(
    password,
    parseInt(process.env.HASHINGALT) || 10
  );
  const newAdmin = await AdminModel.create({
    email,
    password: hashedPassword,
  });

  if (!newAdmin) {
    throw new SendError(400, "Failed to create admin");
  }

  const adminResponse = newAdmin.toObject();
  delete adminResponse.password;

  res.status(201).json({
    status: "success",
    message: "Admin created successfully",
    data: adminResponse,
  });
});



export const login = ErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminModel.findOne({ email });
  if (!admin) throw new SendError(404, "Admin not found");

  const match = bcrypt.compareSync(password, admin.password);
  if (!match) throw new SendError(401, "Invalid password");

  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET, 
    { expiresIn: "1d" }
  );

  res.status(200).json({ status: "success", token });
});