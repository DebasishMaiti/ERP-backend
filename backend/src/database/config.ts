import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.ERP_DATABASE_URL as string);
    console.log('Connected To Database');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};
