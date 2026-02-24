import React from "react";
import { FileText, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";



function Sidebar({
  title,
  content,
  setTitle,
  setContent,
  createNote
})
 {

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
  onClick={createNote}
>


            <Plus className="w-5 h-5" />

          </button>

        </div>

        <div className="relative mb-4">

          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />

          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

        </div>

        <button
          onClick={() => navigate("/rooms")}
          className="w-full mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-lg shadow"
        >

          Back to Rooms

        </button>
        <button
  onClick={() => navigate("/mynotes")}
  className="w-full mt-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-lg shadow"
>
  My Notes
</button>


      </div>

    </div>

  );

} export default Sidebar;
