import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Prisma Studio: http://localhost:5555 (run 'npm run prisma:studio')`);
});
