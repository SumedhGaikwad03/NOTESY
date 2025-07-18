// this is used for curd oprations 


import express from 'express';
import Note from '../models/note.js';

const router = express.Router();

// GET all note
router.get('/', async (req, res) => {
  const notes = await Note.find();
  
  console.log("hello");
  res.json(notes);
});

 // this is made to add a note
router.post('/add', async (req, res) => {
  const { title, content } = req.body;
  const note = new Note({ title, content });
 await note.save();
  res.status(201).json(note);
 console.log("note added"); 
});
// this is just a test route
// you can remove it later
router.get('/getnote', async (req, res) => {
  const { ID } = req.body;
  const note = await Note.findById(ID);
  res.status(200).json(note);
  console.log("hello from get");
});

router.get('/allnotes', async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
  console.log("hello from all notes");
});

router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const note = await Note.findByIdAndUpdate(id, { title, content }, { new: true });
  res.status(200).json(note);
  console.log("note updated");
});

router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  await Note.findByIdAndDelete(id);
  console.log("Note deleted");
  res.status(204).send(); 
});
export default router;
