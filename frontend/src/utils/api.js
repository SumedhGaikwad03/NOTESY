import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
}); // this is an axios object that will help send requests to backend from the frontend 

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

// Notes APIs

// this is an redundant route 
// export const getAllNotes = () => api.get("/notes/allnotes");

//this is to get my notes for an webpage 
//export const getMyNotes = () => api.get("/notes/my");

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




export default api; // this is an axios a obj which makes api calls to the backend and we are expoeting 

// this further calls  notes handels 
// this also calls taskrouter and roomrouter form axios instace and using the api instace 
