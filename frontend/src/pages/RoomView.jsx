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

  /* ---------------- FETCHERS ---------------- */

  const fetchNotes = async () => {
    const res = await api.get(`/rooms/${roomId}/notes`);
    setNotes(res.data);
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

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    const refreshNotes = () => fetchNotes();
    const refreshTasks = () => fetchTasks();

    socket.on("note_created", refreshNotes);
    socket.on("note_updated", refreshNotes);
    socket.on("note_deleted", refreshNotes);

    socket.on("task_created", refreshTasks);
    socket.on("task_updated", refreshTasks);
    socket.on("task_deleted", refreshTasks);

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
<div className="flex-1 overflow-y-auto space-y-2">
  {[
    ...tasks.filter(t => !t.completed),
    ...tasks.filter(t => t.completed)
  ].map(task => (
    <div
      key={task._id}
      className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={async () => {
            await api.put(`/rooms/${roomId}/tasks/${task._id}`, {
              completed: !task.completed
            });
          }}
        />

        <div>
          <div
            className={`text-sm ${
              task.completed ? "line-through text-gray-400" : ""
            }`}
          >
            {task.text}
          </div>

          <div className="text-xs text-gray-400">
            {task.createdBy?.username}
          </div>
        </div>
      </div>

      <button
        onClick={async () => {
          await api.delete(`/rooms/${roomId}/tasks/${task._id}`);
        }}
        className="text-red-400 text-sm"
      >
        ×
      </button>
    </div>
  ))}
</div>

<motion.div
  animate={{ scale: showTasks ? 0.99 : 1 }}
  transition={{ duration: 0.2 }}
  className="flex-1 flex flex-col"
></motion.div>

{/* Add Task (Bottom) */}
<div className="mt-4 pt-3 border-t flex gap-2">
  <input
    placeholder="Add a task..."
    className="flex-1 border rounded px-2 py-1 text-sm"
    onKeyDown={async (e) => {
      if (e.key === "Enter" && e.target.value.trim()) {
        await api.post(`/rooms/${roomId}/tasks`, {
          text: e.target.value
        });
        e.target.value = "";
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
    <div className="flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md shadow-md">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-amber-700">Notesy</h1>
        <div className="bg-yellow-100 px-4 py-2 rounded-lg shadow">
          {room?.name}
        </div>
      </div>

      <div className="flex items-center gap-6 max-w-xl overflow-x-auto">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
          {onlineUsers.length} online
        </span>

        <div className="flex items-center gap-3 overflow-x-auto max-w-md">
          {room?.members?.map(member => {
            const isOnline = onlineUsers.includes(String(member._id));

            return (
              <div
                key={member._id}
                className="px-3 py-1 bg-amber-200 rounded-full text-sm whitespace-nowrap flex items-center gap-2 shadow-sm"
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

        <button
          onClick={() => setShowTasks(prev => !prev)}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg whitespace-nowrap"
        >
          Room Tasks
        </button>

        <button
          onClick={() => setShowActivity(true)}
          className="px-4 py-2 bg-gray-200 rounded-lg whitespace-nowrap"
        >
          Activity
        </button>

        <button
          onClick={() => setShowInvite(true)}
          className="px-3 py-1 bg-gray-300 rounded-full whitespace-nowrap"
        >
          +
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
            currentUserId={localStorage.getItem("userId")}
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

        </motion.div>
      
      );
}

export default RoomView;