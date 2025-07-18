import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import notesRouter from './routes/notes.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://notesy-sumedh-gaikwads-projects.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/notes', notesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
