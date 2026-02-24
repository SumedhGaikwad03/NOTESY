import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  socket.auth = {
    token: localStorage.getItem("token"),
  };
  socket.connect();
};

export default socket;