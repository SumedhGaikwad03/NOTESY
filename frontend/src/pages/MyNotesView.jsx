import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import "../index.css";

function MyNotesView() {

  const [notes, setNotes] = useState([]);

  const fetchMyNotes = async () => {

    try {

      const res = await api.get("/notes/my");

      setNotes(res.data);

      console.log("My notes fetched:", res.data);

    } catch (error) {

      console.error("Error fetching my notes:", error);

    }

  };

  useEffect(() => {

    fetchMyNotes();

  }, []);

  return (

    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-amber-100">

      <Sidebar />

      <div className="flex-1 p-4 overflow-y-auto">

        <h1 className="text-2xl font-bold mb-4">
          My Notes
        </h1>

        {notes.length === 0 ? (

          <p>No notes found.</p>

        ) : (

          notes.map(note => (

            <div
              key={note._id}
              className="bg-white p-4 mb-3 shadow rounded"
            >

              <h3 className="font-bold">
                {note.title}
              </h3>

              <p>
                {note.content}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Room: {note.room}
              </p>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default MyNotesView;
