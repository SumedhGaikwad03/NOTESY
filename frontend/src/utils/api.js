import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

// Notes APIs

export const getAllNotes = () => api.get("/notes/allnotes");

export const getMyNotes = () => api.get("/notes/my");

export const addNote = (note) => api.post("/notes/add", note);

export const updateNote = (id, updatedNote) =>
  api.put(`/notes/update/${id}`, updatedNote);

export const deleteNote = (id) =>
  api.delete(`/notes/delete/${id}`);

// Auth APIs

export const signup = (data) =>
  api.post("/auth/signup", data);

export const login = (data) =>
  api.post("/auth/login", data);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);




export default api;
