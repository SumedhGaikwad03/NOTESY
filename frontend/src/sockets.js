import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  socket.auth = { // here the auth is directly calling to the backend socket.js file where we have defined the instance for these type of 
    // sockets namely io instance and there we verify the token and then the req is allowed to pass via next() function 
    token: localStorage.getItem("token"),
  };
  socket.connect();
};

export default socket;