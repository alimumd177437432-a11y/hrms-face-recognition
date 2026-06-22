import express from "express";
import { bootstrap } from "./src/bootstrap.js";
import dotenv from "dotenv";


dotenv.config();

const app = express();
app.use(express.json({ limit: "20kb" }));
bootstrap(app);

const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
