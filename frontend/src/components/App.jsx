
// this is the main application component that sets up routing for the note-taking app 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NoteMain from './NoteMain';
import AllNotes from './allNotes';
import Signup from './Signup';
import Login from './Login'; 
import PrivateRoute from './PrivateRoute';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
         {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <NoteMain />
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
    </Router>
  );
}

export default App;
