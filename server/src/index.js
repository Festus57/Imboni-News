import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = Number(process.env.PORT || 8000);

const startServer = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('PORT must be a valid TCP port.');

  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Imboni News API listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('Failed to start Imboni News API:', error.message);
  process.exit(1);
});
