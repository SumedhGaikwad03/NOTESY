// this is a schema for a Note model
// it defines the structure of a note in the database in mo ongodb using mongoose

import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // each note must be associated with a user, so we set required to true
  }
});

export default mongoose.model('Note', noteSchema);
