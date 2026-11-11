import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Atlas connection with generous timeouts for network latency
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,  // 30s — Atlas can be slow on first connect
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
