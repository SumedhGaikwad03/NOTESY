// this is used for curd oprations 

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import Note from '../models/note.js';

const router = express.Router();

// GET all note
router.get('/', async (req, res) => {
  const notes = await Note.find();// this .find() method retrieves all documents from the "notes" collection in the database.that is mongodb 
  
  console.log("hello");
  res.json(notes);
});

 // this is made to add a note
router.post('/add', async (req, res) => {
  const { title, content } = req.body;
  const note = new Note({ title, content , user: req.userId }); // we are getting user id from token and then we are using 
  // that user id to create a note for that user only
 await note.save();
  res.status(201).json(note);
 console.log("note added"); 
});
// this is just a test route
// you can remove it later
router.get('/getnote', async (req, res) => {
  const { ID } = req.body;
  const note = await Note.findById(ID);
  res.status(200).json(note); // this returns a json obj of note to the calling link that is from api.js getNoteById function
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

router.get("/", authMiddleware, async (req, res) => {
    const notes = await Note.find({ user: req.user.userId });
    res.json(notes); // now user can access only his notes not other users notes because 
    // we are using authmiddleware and in that we are getting user id from token and then we are
    //  using that user id to find notes of that user only
    });
export default router;
