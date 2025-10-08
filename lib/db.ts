import mongoose from "mongoose";


const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI must be defined")
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("Connected to MongoDB",db.connection.name);
  } catch(err) {
    console.log("Error connecting to MongoDB",err);
    throw err
  }
}
