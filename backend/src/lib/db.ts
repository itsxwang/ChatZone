import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
   const conn = await mongoose.connect(process.env.MONGO_URI || '' );
    console.log('MongoDB connected successfully', conn.connection.host);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // 1 status code means failure, 0 for success
  }
};
