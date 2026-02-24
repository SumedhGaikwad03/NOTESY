import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

import ActivityPanel from "../components/ActivityPanel";
import InviteModal from "../components/InviteModal";
import NoteEditorModal from "../components/NoteEditorModal";
import NoteCard from "../components/NoteCard";

import socket, { connectSocket } from "../sockets";
import { AnimatePresence, motion } from "framer-motion";

function RoomView() {
  const { roomId } = useParams();

  /* ---------------- STATE ---------------- */

  const [notes, setNotes] = useState([]);
  const [room, setRoom] = useState(null);

   const currentUserId = localStorage.getItem("userId");

  const [showEditor, setShowEditor] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [activity, setActivity] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});

  const [tasks, setTasks] = useState([]);

  const [inviteError , setInviteError] = useState("");

  const [showBetaNotice, setShowBetaNotice] = useState(false);

 

  /* ---------------- FETCHERS ---------------- */

  const fetchNotes = async () => {
    const res = await api.get(`/rooms/${roomId}/notes`);
    setNotes(res.data);
  };

  const closeBetaNotice = () => {
  localStorage.setItem("notesy_beta_seen", "true");
  setShowBetaNotice(false);
  };

  const fetchRoom = async () => {
    const res = await api.get(`/rooms/${roomId}`);
    setRoom(res.data);
  };

  const fetchActivity = async () => {
    const res = await api.get(`/rooms/${roomId}/activity`);
    setActivity(res.data);
  };

  const fetchTasks = async () => {
    const res = await api.get(`/rooms/${roomId}/tasks`);
    setTasks(res.data);
  };

  /* ---------------- NOTE ACTIONS ---------------- */

  const createNote = async () => {
    if (!title.trim() || !content.trim()) return;
    await api.post("/notes/add", { title, content, roomId });
    setTitle("");
    setContent("");
    setShowEditor(false);
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/delete/${id}`);
    fetchActivity();
  };

  const saveEdit = async (id) => {
    await api.put(`/notes/update/${id}`, {
      title: editTitle,
      content: editContent
    });
    setEditingId(null);
    fetchActivity();
  };

  const addMember = async () => {
  try {
    setInviteError("");

    await api.put(`/rooms/${roomId}/add-member`, {
      userEmail: inviteEmail
    });

    setInviteEmail("");
    setShowInvite(false);
    fetchRoom();
    fetchActivity();

  } catch (err) {
    if (err.response?.data?.message) {
      setInviteError(err.response.data.message);
    } else {
      setInviteError("Something went wrong.");
    }
  }

  

};

  /* ---------------- SOCKET LOGIC ---------------- */

  useEffect(() => {
    fetchNotes();
    fetchRoom();
    fetchActivity();
    fetchTasks();

    connectSocket();

    const joinRoom = () => socket.emit("join_room", roomId);

    const hasSeen = localStorage.getItem("notesy_beta_seen");
  if (!hasSeen) {
    setShowBetaNotice(true);
  } 

  
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    const refreshNotes = () => fetchNotes();
    const refreshTasks = () => fetchTasks();

    socket.on("note_created", refreshNotes);
    socket.on("note_updated", refreshNotes);
    socket.on("note_deleted", refreshNotes);
socket.on("task_created", (task) => {
  setTasks(prev => {
    if (prev.some(t => t._id === task._id)) return prev;
    return [task, ...prev];
  });
});
socket.on("task_updated", (updatedTask) => {
  setTasks(prev =>
    prev.map(t => t._id === updatedTask._id ? updatedTask : t)
  );
});

socket.on("task_deleted", (taskId) => {
  setTasks(prev => prev.filter(t => t._id !== taskId));
});

    socket.on("online_users_update", setOnlineUsers);

    socket.on("note_editing_update", ({ noteId, userId, isEditing }) => {
      setEditingUsers(prev => {
        const updated = { ...prev };
        if (isEditing) updated[noteId] = userId;
        else delete updated[noteId];
        return updated;
      });
    });

    return () => {
      socket.emit("leave_room", roomId);
      socket.off();
    };
  }, [roomId]);

  /* ---------------- UTILS ---------------- */

  const getRotation = (id) => {
    const seed = id.slice(-3);
    return ((parseInt(seed, 16) % 5) - 2) * 1.5;
  };

  const renderActivityText = (item) => {
    switch (item.type) {
      case "note_created":
        return `created note "${item.meta?.title}"`;
      case "note_updated":
        return `updated note "${item.meta?.title}"`;
      case "note_deleted":
        return `deleted note "${item.meta?.title}"`;
      case "member_added":
        return `added member "${item.meta?.username}"`;
      default:
        return `did something mysterious`;
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6e3] via-[#fef9e7] to-[#fffdf5]" />
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(#00000010_1px,transparent_1px),linear-gradient(90deg,#00000010_1px,transparent_1px)] bg-[size:40px_40px]" />
       
     
 
      {/* Main Content */}
   <div className="relative z-10 flex min-h-screen">


      {/* Sidebar */}
      <AnimatePresence>
        {showTasks && (
          <motion.div
             initial={{ width: 0 }}
      animate={{ width: 320 }}
      exit={{ width: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="overflow-hidden bg-white border-r shadow-xl shrink-0"
          >
            <h2 className="font-semibold mb-4">Room Tasks</h2>

{/* Task List */}
<div className="flex-1 overflow-y-auto space-y-2 ">
  {[
    ...tasks.filter(t => !t.completed),
    ...tasks.filter(t => t.completed)
  ].map(task => (
    <div
    
    
      key={task._id}
      className={`
  flex items-start justify-between
  p-4 rounded-xl
  bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100
  shadow-sm hover:shadow-md
  border border-yellow-200
  hover:-translate-y-0.5
  transition-all duration-200
  ${task.completed ? "opacity-70" : ""}
`}
    >
      <div className="flex items-center gap-3 w-full">
        <input
          type="checkbox"
          checked={task.completed}
          className="mt-1 accent-amber-500 w-4 h-4"
          onChange={async () => {
  const updatedCompleted = !task.completed;

  // 1️⃣ Optimistically update UI
  setTasks(prev =>
    prev.map(t =>
      t._id === task._id
        ? { ...t, completed: updatedCompleted }
        : t
    )
  );

  try {
    // 2️⃣ Tell server
    await api.put(`/rooms/${roomId}/tasks/${task._id}`, {
      completed: updatedCompleted
    });
  } catch (err) {
    // 3️⃣ Revert if it fails (optional but clean)
    setTasks(prev =>
      prev.map(t =>
        t._id === task._id
          ? { ...t, completed: !updatedCompleted }
          : t
      )
    );
  }
}}

        
        />

        <div className="flex-1">
          <div
          
            className={`text-sm font-medium transition ${
              task.completed ? "line-through text-gray-400" : "text-amber-900"
            }`}
          >
            {task.text}
          </div>

          <div className="text-xs text-amber-600 mt-1">
            {task.createdBy?.username || "You"}
          </div>
        </div>
      </div>

      <button
        onClick={async () => {
  const previousTasks = tasks;

  // 1️⃣ Remove instantly
  setTasks(prev => prev.filter(t => t._id !== task._id));

  try {
    await api.delete(`/rooms/${roomId}/tasks/${task._id}`);
  } catch (err) {
    // 2️⃣ Restore if fails
    setTasks(previousTasks);
  }
}}
        className="
  text-amber-600
  hover:text-red-500
  transition
  text-lg
  font-bold
  ml-3
"
      >
        ×
      </button>
    </div>
  ))}
</div>



{/* Add Task (Bottom) */}
<div className="mt-4 pt-3 border-t flex gap-2">
  <input
    placeholder="Add a task..."
    className="flex-1 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
    onKeyDown={async (e) => {
  if (e.key === "Enter" && e.target.value.trim()) {
    const text = e.target.value.trim();

    // Temporary fake ID
    const tempId = "temp-" + Date.now();

    const optimisticTask = {
      _id: tempId,
      text,
      completed: false,
      createdBy: { username: "You" }
    };

    // 1️⃣ Add immediately
    setTasks(prev => [...prev, optimisticTask]);

    e.target.value = "";

    try {
      const res = await api.post(`/rooms/${roomId}/tasks`, { text });

      // 2️⃣ Replace temp task with real one
      setTasks(prev =>
        prev.map(t => (t._id === tempId ? res.data : t))
      );
    } catch (err) {
      // 3️⃣ Remove if failed
      setTasks(prev => prev.filter(t => t._id !== tempId));
    }
  }
}}
  />
</div>
            
          </motion.div>
        )}
      </AnimatePresence>

      

  

  {/* Board Wrapper */}
  <motion.div
    animate={{ scale: showTasks ? 0.99 : 1 }}
    transition={{ duration: 0.2 }}
    className="flex-1 flex flex-col"
  >

   {/* HEADER */}
<div className="flex items-center px-8 py-4 bg-white/80 backdrop-blur-md shadow-md">

  {/* LEFT */}
  <div className="flex items-center gap-6">
    <h1 className="text-2xl font-bold text-amber-700 flex items-center gap-3">
      Notesy
      <span
        onClick={() => setShowBetaNotice(true)}
        className="text-xs px-2 py-1 bg-amber-500 text-white rounded-full tracking-wider shadow-sm cursor-pointer hover:scale-105 hover:shadow-md transition"
      >
        BETA
      </span>
    </h1>

    <div className="bg-yellow-100 px-4 py-2 rounded-lg shadow">
      {room?.name}
    </div>
  </div>

  {/* CENTER */}
  <div className="flex-1 flex justify-center px-6">
    <div className="max-w-[650px] w-full">
      <div className="flex items-center gap-3 overflow-x-auto scroll-smooth scrollbar-hide">
        {room?.members?.map(member => {
          const isOnline = onlineUsers.includes(String(member._id));

          return (
            <div
              key={member._id}
              className="px-4 py-1.5 bg-amber-200 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 shadow-sm"
            >
              <span>{member.username}</span>

              {isOnline && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-2.5 h-2.5 bg-green-500 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-3 ml-auto">
    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
      {onlineUsers.length} online
    </span>

    <button
      onClick={() => setShowTasks(prev => !prev)}
      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg whitespace-nowrap"
    >
      Tasks
    </button>

    <button
      onClick={() => setShowActivity(true)}
      className="px-4 py-2 bg-gray-200 rounded-lg whitespace-nowrap"
    >
      Activity
    </button>

    <button
      onClick={() => setShowBetaNotice(true)}
      className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg whitespace-nowrap hover:bg-amber-200 transition flex items-center gap-2"
    >
      Contact
    </button>

    <button
      onClick={() => setShowInvite(true)}
      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
    >
      Invite
    </button>
  </div>

</div>
    {/* NOTES GRID */}
    <div className="p-8 flex flex-wrap gap-8 justify-start">
      <AnimatePresence>
        {notes.map(note => (
          <NoteCard
            key={note._id}
            note={note}
            editingId={editingId}
            setEditingId={setEditingId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editContent={editContent}
            setEditContent={setEditContent}
            saveEdit={saveEdit}
            deleteNote={deleteNote}
            getRotation={getRotation}
            roomId={roomId}
            editingUsers={editingUsers}
            socket={socket}
            currentUserId={currentUserId}
          />
        ))}
      </AnimatePresence>
    </div>

    {/* Floating Button */}
    <motion.button
      whileHover={{ scale: 1.15, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setShowEditor(true)}
      className="fixed bottom-8 right-8 w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl text-3xl flex items-center justify-center"
    >
      +
    </motion.button>

  </motion.div>
</div>
        {/* MODALS */}
        <NoteEditorModal
          show={showEditor}
          title={title}
          content={content}
          setTitle={setTitle}
          setContent={setContent}
          onClose={() => setShowEditor(false)}
          onSave={createNote}
        />

        <InviteModal
          show={showInvite}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          onClose={() => setShowInvite(false)}
          onInvite={addMember}
          error={inviteError}
          setError={setInviteError}
        />

        <ActivityPanel
          show={showActivity}
          activity={activity}
          onClose={() => setShowActivity(false)}
          renderActivityText={renderActivityText}
        />
        {showBetaNotice && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
   <div className="bg-white w-[460px] rounded-2xl p-7 shadow-2xl border border-amber-200 relative">

  <div
        onClick={() => setShowBetaNotice(false)}
        className="absolute top-4 right-4 text-xs px-2 py-1 bg-amber-500 text-white rounded-full tracking-wide cursor-pointer hover:scale-105 transition"
      >
        BETA
      </div>

  <h2 className="text-xl font-semibold text-amber-800 mb-4">
    Welcome to Notesy
  </h2>

  <p className="text-sm text-gray-600 leading-relaxed mb-4">
    You're using an early version of Notesy.  
    Create rooms, collaborate in real-time with friends, and manage notes together inside shared spaces.
  </p>

  <p className="text-sm text-gray-500 mb-5">
    We're actively improving the experience based on feedback.  
    If something feels off, that insight helps shape the product.
  </p>

  <div className="text-xs text-gray-500 mb-6">
    Feedback or suggestions:
    <div className="mt-2 flex gap-4">
      <a
        href="mailto:SumedhGaikwad.dev@gmail.com"
        className="underline hover:text-amber-700 transition"
      >
        Email :- SumedhGaikwad.dev@gmail.com
      </a>
      <a
        href="https://www.linkedin.com/in/sumedh-gaikwad-8b95292a6"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-amber-700 transition"
      >
        LinkedIn
      </a>
    </div>
  </div>

  <div className="flex justify-end">
    <button
      onClick={closeBetaNotice}
      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg shadow hover:shadow-md hover:scale-105 transition-all duration-200"
    >
      Got it
    </button>
  </div>
</div>
  </div>
)}

        </motion.div>
      
      );
}

export default RoomView;