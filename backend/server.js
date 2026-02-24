import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

import notesRouter from './routes/notes.js';
import authRouter from './routes/Auth.js';
import roomRouter from './routes/rooms.js';
import taskrouter from './routes/tasks.js';

import { initSocket } from './socket.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "https://notesy-sumedh-gaikwads-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// Routes
app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);
app.use("/api/rooms", taskrouter);
app.use('/api/rooms', roomRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


// 🔥 Create HTTP server (required for socket.io)
const server = http.createServer(app);

// 🔌 Initialize socket
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
