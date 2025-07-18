import axios from "axios";

const BASE_URL = "http://localhost:5000/api/notes"; 

// this is basically an file that is the middle layer between the frontend and backend
export const getAllNotes = () => {
  return axios.get(`${BASE_URL}/allnotes`);
};

// ➕ Add a new note
export const addNote = (note) => {
  return axios.post(`${BASE_URL}/add`, note);
};

// Update a note
export const updateNote = (id, updatedNote) => {
 
  return axios.put(`${BASE_URL}/update/${id}`, updatedNote);
};

// Delete a note
export const deleteNote = (id) => {
  return axios.delete(`${BASE_URL}/delete/${id}`);
};


export const getNoteById = (id) => {
  return axios.get(`${BASE_URL}/getnote`, { data: { ID: id } });
};





