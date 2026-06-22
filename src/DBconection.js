import mongoose  from "mongoose";
import dotenv from "dotenv"
dotenv.config()


export const DBconection = async()=> {
    const conection = await mongoose.connect(`${process.env.MONGO_URL}`)
    return conection
}