import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import notesRouter from './routes/notes.js';
import authRouter from './routes/Auth.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ["https://notesy-sumedh-gaikwads-projects.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));


app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// we need to set up a server using express framework as this is a backend file . it has various 
// functions such as connecting to mongodb using mongoose and setting up routes for notes
// cors is used to allow cross origin requests from frontend to backend 