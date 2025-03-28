import mongoose from 'mongoose';
require('dotenv').config();

const connectDB = async () => {
  try {
    // Removed useNewUrlParser and useUnifiedTopology options
    await mongoose.connect(process.env.MONGODB_CONNECTION_LINK || 'mongodb+srv://developer:efE7i6q68w7d6kE7@easylaw.7kmf3.mongodb.net/?retryWrites=true&w=majority&appName=easylaw', {
      // Other options if needed
    });
    console.log('MongoDB connected');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;



