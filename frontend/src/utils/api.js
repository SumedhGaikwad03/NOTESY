import axios from "axios";

const api = axios.create({
  //baseURL: "https://notesy-backend-xrw3.onrender.com/api",
   baseURL: process.env.REACT_APP_API_URL, 
});


 api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});




// this is basically an file that is the middle layer between the frontend and backend
export const getAllNotes = () => api.get("/notes");

export const addNote = (note) => api.post("/notes", note);

export const updateNote = (id, updatedNote) =>
  api.put(`/notes/${id}`, updatedNote);

export const deleteNote = (id) => api.delete(`/notes/${id}`);

// Auth APIs

export const signup = (data) => api.post("/auth/signup", data);

export const login = (data) => api.post("/auth/login", data);




export default api;







