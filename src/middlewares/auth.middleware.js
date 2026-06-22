import jwt from "jsonwebtoken";
import { SendError } from "../services/errorHandeler.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    throw new SendError(401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    throw new SendError(401, "Invalid token");
  }
};