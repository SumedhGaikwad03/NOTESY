import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import socket from "./sockets";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";
import RoomView from "./pages/RoomView";
import AllNotes from "./pages/allNotes";
import PrivateRoute from "./components/PrivateRoute";
import MyNotesView from "./pages/MyNotesView";

function App() {

  // 🔌 Connect socket ONCE when app loads
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // do NOT disconnect on route change
      // only disconnect if entire app unmounts (rare)
    };
  }, []);

  return (
    <Router>
      <div className="animate-page">
      <Routes>

        <Route
          path="/mynotes"
          element={
            <PrivateRoute>
              <MyNotesView />
            </PrivateRoute>
          }
        />

        {/* Public */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Redirect root → rooms */}
        <Route
  path="/"
  element={
    localStorage.getItem("token")
      ? <Navigate to="/rooms" />
      : <Navigate to="/login" />
  }
/>

        {/* Protected */}
        <Route
          path="/rooms"
          element={
            <PrivateRoute>
              <Rooms />
            </PrivateRoute>
          }
        />

        <Route
          path="/rooms/:roomId"
          element={
            <PrivateRoute>
              <RoomView />
            </PrivateRoute>
          }
        />

        <Route
          path="/all-notes"
          element={
            <PrivateRoute>
              <AllNotes />
            </PrivateRoute>
          }
        />

      </Routes>
      </div>
    </Router>
  );
}

export default App;
