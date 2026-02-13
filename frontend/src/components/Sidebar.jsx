// src/components/Sidebar.jsx
// this is the sidebar component for the note-taking application. It includes
// branding, a search bar, a button to add new notes, and navigation to view all notes.
import React from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { handleAddNote } from '../utils/noteHandlers';
import { useNavigate } from 'react-router-dom';

function Sidebar({ title, content, setTitle, setContent }) {
  const navigate = useNavigate();

  return (
    <div className="w-80 bg-white shadow-xl border-r border-yellow-200 flex flex-col">
      <div className="p-6 border-b border-yellow-100 bg-gradient-to-r from-yellow-100 to-amber-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notesy
          </h1>
          <button
            type="button"
            onClick={() => handleAddNote(title, content, setTitle, setContent)}
            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 backdrop-blur-sm"
          />
        </div>

        
        <button
          onClick={() => navigate('/all-notes')}
          className="w-full mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-lg shadow transition duration-200"
        >
          View All Notes
        </button>
      </div>

     <div className="flex-1 overflow-y-auto">
  <div className="p-6 text-amber-700 text-sm leading-relaxed">
    <h3 className="text-lg font-semibold text-amber-800 mb-2">About Notesy</h3>
    <p>
      <strong>Notesy</strong> is a clean and minimal note-taking app built using the <strong>MERN stack</strong>.
      You can create, view, edit, and delete notes in real-time with a user-friendly interface.
    </p>
    <p className="mt-2">
      Developed by <span className="font-medium">Sumedh </span> to learn and showcase full-stack web development skills.
    </p>
    <p className="mt-2 italic text-amber-600">"Simple. Fast. Yours."</p>
  </div>
     </div>
      </div>
    
  );
}

export default Sidebar;
