import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectMongoDB = async () => {
    try {
       const connection = await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB connected successfully at ${connection.connection.host}`);

    }catch (error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1) // Exit process with failure
    
    }
}
export default connectMongoDB;