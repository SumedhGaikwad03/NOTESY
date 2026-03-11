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
  const [inviteError, setInviteError] = useState("");
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
    const tempId = "temp-" + Date.now();
    const optimisticNote = {
      _id: tempId, title: title.trim(), content: content.trim(),
      roomId, createdBy: { _id: currentUserId }, isOptimistic: true
    };
    setNotes(prev => [optimisticNote, ...prev]);
    setTitle(""); setContent(""); setShowEditor(false);
    try {
      const res = await api.post("/notes/add", { title, content, roomId });
      setNotes(prev => prev.map(note => note._id === tempId ? res.data : note));
    } catch (err) {
      console.error("Error creating note:", err);
      setNotes(prev => prev.filter(note => note._id !== tempId));
    }
  };

  const deleteNote = async (id) => {
    const prevNotes = notes;
    setNotes(prev => prev.filter(note => note._id !== id));
    try {
      await api.delete(`/notes/delete/${id}`);
      fetchActivity();
    } catch (err) {
      console.error("Error deleting note:", err);
      setNotes(prevNotes);
    }
  };

  const saveEdit = async (id) => {
    const prevNotes = notes;
    setNotes(prev => prev.map(note => note._id === id ? { ...note, title: editTitle, content: editContent } : note));
    setEditingId(null);
    try {
      await api.put(`/notes/update/${id}`, { title: editTitle, content: editContent });
      fetchActivity();
    } catch (err) {
      console.error("Error saving edit:", err);
      setNotes(prevNotes);
      setEditingId(null);
    }
  };

  const addMember = async () => {
    try {
      setInviteError("");
      await api.put(`/rooms/${roomId}/add-member`, { userEmail: inviteEmail });
      setInviteEmail(""); setShowInvite(false);
      fetchRoom(); fetchActivity();
    } catch (err) {
      setInviteError(err.response?.data?.message || "Something went wrong.");
    }
  };

  /* ---------------- SOCKET ---------------- */

  useEffect(() => {
    fetchNotes(); fetchRoom(); fetchActivity(); fetchTasks();
    connectSocket();
    const joinRoom = () => socket.emit("join_room", roomId);
    const hasSeen = localStorage.getItem("notesy_beta_seen");
    if (!hasSeen) setShowBetaNotice(true);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    socket.on("note_created", (note) => {
      setNotes(prev => {
        if (prev.some(n => n._id === note._id)) return prev;
        const optimistic = prev.find(n => n.isOptimistic && n.title === note.title);
        if (optimistic) return prev.map(n => n._id === optimistic._id ? note : n);
        return [note, ...prev];
      });
    });
    socket.on("note_updated", (note) => setNotes(prev => prev.map(n => n._id === note._id ? note : n)));
    socket.on("note_deleted", (noteId) => setNotes(prev => prev.filter(n => n._id !== noteId)));

    socket.on("task_created", (task) => {
      setTasks(prev => {
        const match = prev.find(t => t.isOptimistic && t.text === task.text && t.createdBy?._id === task.createdBy?._id);
        if (match) return prev.map(t => t._id === match._id ? task : t);
        if (!prev.some(t => t._id === task._id)) return [task, ...prev.filter(t => !t.isOptimistic)];
        return prev;
      });
    });
    socket.on("task_updated", (updatedTask) => setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t)));
    socket.on("task_deleted", (taskId) => setTasks(prev => prev.filter(t => String(t._id) !== String(taskId))));
    socket.on("online_users_update", setOnlineUsers);
    socket.on("note_editing_update", ({ noteId, userId, isEditing }) => {
      setEditingUsers(prev => {
        const updated = { ...prev };
        if (isEditing) updated[noteId] = userId;
        else delete updated[noteId];
        return updated;
      });
    });

    return () => { socket.emit("leave_room", roomId); socket.off(); };
  }, [roomId]);

  /* ---------------- UTILS ---------------- */

  const getRotation = (id) => {
    const seed = id.slice(-3);
    return ((parseInt(seed, 16) % 5) - 2) * 1.5;
  };

  const renderActivityText = (item) => {
    switch (item.type) {
      case "note_created": return `created note "${item.meta?.title}"`;
      case "note_updated": return `updated note "${item.meta?.title}"`;
      case "note_deleted": return `deleted note "${item.meta?.title}"`;
      case "member_added": return `added member "${item.meta?.username}"`;
      default: return `did something mysterious`;
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .room-root * { font-family: 'DM Sans', sans-serif; }
        .brand-font  { font-family: 'Playfair Display', serif; }

        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .header-shimmer {
          height: 2px;
          background: linear-gradient(90deg, transparent, #fbbf24, #f97316, #fbbf24, transparent);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .member-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #fcd34d;
          border-radius: 100px;
          font-size: 12px; font-weight: 500; color: #78350f;
          white-space: nowrap;
          transition: box-shadow 0.2s;
        }
        .member-chip:hover { box-shadow: 0 2px 8px rgba(251,191,36,0.4); }

        .header-btn {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px; font-weight: 500;
          border: none; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .header-btn:hover { transform: translateY(-1px); }
        .header-btn:active { transform: scale(0.97); }

        .task-card {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 1px solid #fde68a;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .task-card:hover { box-shadow: 0 4px 12px rgba(251,191,36,0.25); transform: translateY(-1px); }

        .task-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid #fde68a;
          background: rgba(255,255,255,0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #1c1917;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .task-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(251,146,60,0.15); }
        .task-input::placeholder { color: #a8a29e; }

        .fab {
          position: fixed; bottom: 32px; right: 32px;
          width: 60px; height: 60px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; border: none; border-radius: 50%;
          font-size: 28px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(234,88,12,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .fab:hover { box-shadow: 0 12px 32px rgba(234,88,12,0.5); }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="room-root min-h-screen relative overflow-x-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6e3] via-[#fef9e7] to-[#fffdf5]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(#00000015_1px,transparent_1px),linear-gradient(90deg,#00000015_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 flex min-h-screen">

          {/* ── TASK SIDEBAR ── */}
          <AnimatePresence>
            {showTasks && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowTasks(false)}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-30"
                />
                <motion.div
                  initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }}
                  transition={{ type: "spring", stiffness: 280, damping: 32 }}
                  className="fixed inset-y-0 left-0 w-full md:w-[320px] z-40 flex flex-col"
                  style={{
                    background: "rgba(255,253,245,0.95)",
                    backdropFilter: "blur(20px)",
                    borderRight: "1px solid rgba(253,230,138,0.6)",
                    boxShadow: "4px 0 32px rgba(194,65,12,0.08)"
                  }}
                >
                  {/* Sidebar header */}
                  <div className="px-5 pt-5 pb-4 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #fbbf24, #f97316)" }} />
                        <h2 className="brand-font text-lg font-bold text-amber-800">Room Tasks</h2>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">
                          {tasks.filter(t => !t.completed).length} left
                        </span>
                      </div>
                      <button
                        onClick={() => setShowTasks(false)}
                        className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-red-100 hover:text-red-500 transition flex items-center justify-center font-bold text-lg"
                      >×</button>
                    </div>
                  </div>

                  {/* Task list */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
                    {[...tasks.filter(t => !t.completed), ...tasks.filter(t => t.completed)].map(task => (
                      <div key={task._id} className={`task-card ${task.completed ? "opacity-60" : ""}`}>
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                            onChange={async () => {
                              const updated = !task.completed;
                              setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: updated } : t));
                              try {
                                await api.put(`/rooms/${roomId}/tasks/${task._id}`, { completed: updated });
                              } catch {
                                setTasks(prev => prev.map(t => t._id === task._id ? { ...t, completed: !updated } : t));
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${task.completed ? "line-through text-gray-400" : "text-amber-900"}`}>
                              {task.text}
                            </p>
                            <p className="text-xs text-amber-500 mt-0.5">{task.createdBy?.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const taskId = task._id;
                            setTasks(prev => prev.filter(t => t._id !== taskId));
                            if (task.isOptimistic) return;
                            try { await api.delete(`/rooms/${roomId}/tasks/${taskId}`); }
                            catch { fetchTasks(); }
                          }}
                          className="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-amber-400 hover:text-red-500 hover:bg-red-50 transition font-bold text-base"
                        >×</button>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center py-10 text-amber-300 text-sm">
                        <div className="text-3xl mb-2">✓</div>
                        No tasks yet
                      </div>
                    )}
                  </div>

                  {/* Add task */}
                  <div className="px-4 pb-5 pt-3 border-t border-amber-100">
                    <input
                      placeholder="Add a task and press Enter…"
                      className="task-input"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          if (isAdding) return;
                          setIsAdding(true);
                          const text = e.target.value.trim();
                          const tempId = "temp-" + Date.now();
                          const optimisticTask = { _id: tempId, text, completed: false, createdBy: { _id: currentUserId }, isOptimistic: true };
                          setTasks(prev => [...prev, optimisticTask]);
                          e.target.value = "";
                          try {
                            const res = await api.post(`/rooms/${roomId}/tasks`, { text });
                            setTasks(prev => prev.map(t => t._id === tempId ? res.data : t));
                          } catch {
                            setTasks(prev => prev.filter(t => t._id !== tempId));
                          } finally { setIsAdding(false); }
                        }
                      }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── MAIN BOARD ── */}
          <motion.div
            animate={{ scale: showTasks ? 0.99 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >

            {/* HEADER */}
            <div
              className="flex flex-col md:flex-row md:items-center px-4 md:px-8 py-3 gap-4 md:gap-0 overflow-hidden"
              style={{
                background: "rgba(255,253,245,0.9)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(253,230,138,0.5)",
                boxShadow: "0 2px 16px rgba(194,65,12,0.06)"
              }}
            >
              <div className="header-shimmer absolute top-0 left-0 right-0" />

              {/* Left: brand + room name */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#fbbf24,#f97316)", boxShadow: "0 3px 10px rgba(249,115,22,0.3)" }}>
                    <span className="brand-font text-white font-extrabold text-sm">N</span>
                  </div>
                  <span className="brand-font text-lg font-bold text-amber-700">Notesy</span>
                </div>

                <span
                  onClick={() => setShowBetaNotice(true)}
                  className="text-[10px] px-2 py-0.5 bg-amber-500 text-white rounded-full tracking-wider font-semibold cursor-pointer hover:scale-105 transition"
                >BETA</span>

                <div className="h-5 w-px bg-amber-200 hidden md:block" />

                <div className="px-3 py-1.5 rounded-xl text-sm font-semibold text-amber-800"
                  style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1px solid #fcd34d" }}>
                  {room?.name}
                </div>
              </div>

              {/* Center: members */}
              <div className="flex-1 flex justify-start md:justify-center px-0 md:px-6 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {room?.members?.map(member => {
                    const isOnline = onlineUsers.includes(String(member._id));
                    return (
                      <div key={member._id} className="member-chip">
                        <span>{member.username}</span>
                        {isOnline && (
                          <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="w-2 h-2 bg-emerald-400 rounded-full"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:ml-auto">
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "#dcfce7", color: "#166534" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineUsers.length} online
                </span>

                <button
                  onClick={() => setShowTasks(prev => !prev)}
                  className="header-btn"
                  style={{ background: showTasks ? "#e0e7ff" : "#eef2ff", color: "#4338ca" }}
                >
                  ☑ Tasks
                </button>

                <button
                  onClick={() => setShowActivity(true)}
                  className="header-btn"
                  style={{ background: "#f3f4f6", color: "#374151" }}
                >
                  Activity
                </button>

                <button
                  onClick={() => setShowBetaNotice(true)}
                  className="header-btn"
                  style={{ background: "#fef3c7", color: "#92400e" }}
                >
                  Contact
                </button>

                <button
                  onClick={() => setShowInvite(true)}
                  className="header-btn text-white"
                  style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 3px 10px rgba(234,88,12,0.3)" }}
                >
                  + Invite
                </button>
              </div>
            </div>

            {/* NOTES GRID */}
            <div className="p-4 md:p-8 flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
              <AnimatePresence>
                {notes.map(note => (
                  <NoteCard
                    key={note._id}
                    layoutId={note._id}
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

              {notes.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-5xl mb-4 opacity-40">📝</div>
                  <p className="text-amber-700 font-semibold text-lg opacity-50">No notes yet</p>
                  <p className="text-amber-500 text-sm mt-1 opacity-40">Hit the + button to create the first one</p>
                </div>
              )}
            </div>

            {/* FAB */}
            <motion.button
              whileHover={{ scale: 1.12, rotate: 8 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowEditor(true)}
              className="fab"
            >+</motion.button>

          </motion.div>
        </div>

        {/* ── MODALS ── */}
        <NoteEditorModal
          show={showEditor} title={title} content={content}
          setTitle={setTitle} setContent={setContent}
          onClose={() => setShowEditor(false)} onSave={createNote}
        />
        <InviteModal
          show={showInvite} inviteEmail={inviteEmail} setInviteEmail={setInviteEmail}
          onClose={() => setShowInvite(false)} onInvite={addMember}
          error={inviteError} setError={setInviteError}
        />
        <ActivityPanel
          show={showActivity} activity={activity}
          onClose={() => setShowActivity(false)} renderActivityText={renderActivityText}
        />

        {/* Beta Notice */}
        <AnimatePresence>
          {showBetaNotice && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="relative w-full max-w-md rounded-3xl overflow-hidden"
                style={{
                  background: "rgba(255,253,245,0.97)",
                  border: "1px solid rgba(253,230,138,0.6)",
                  boxShadow: "0 24px 64px rgba(194,65,12,0.15)"
                }}
              >
                <div style={{ height: "3px", background: "linear-gradient(90deg,#fbbf24,#f97316,#ea580c,#f97316,#fbbf24)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

                <div className="p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h2 className="brand-font text-2xl font-bold text-amber-800">Welcome to Notesy</h2>
                      <p className="text-amber-500 text-xs mt-1 font-medium tracking-wide uppercase">Early Access</p>
                    </div>
                    <span
                      onClick={() => setShowBetaNotice(false)}
                      className="text-xs px-2.5 py-1 bg-amber-500 text-white rounded-full tracking-wide cursor-pointer hover:scale-105 transition font-semibold"
                    >BETA</span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    You're using an early version of Notesy. Create rooms, collaborate in real-time, and manage notes together inside shared spaces.
                  </p>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    We're actively improving the experience. If something feels off, that insight helps shape the product.
                  </p>

                  <div className="text-xs text-gray-400 mb-6 p-4 rounded-xl" style={{ background: "#fef9e7", border: "1px solid #fde68a" }}>
                    <p className="font-semibold text-amber-700 mb-2">Feedback & suggestions</p>
                    <div className="flex flex-col gap-1.5">
                      <a href="mailto:SumedhGaikwad.dev@gmail.com" className="hover:text-amber-600 transition underline underline-offset-2">
                        ✉ SumedhGaikwad.dev@gmail.com
                      </a>
                      <a href="https://www.linkedin.com/in/sumedh-gaikwad-8b95292a6" target="_blank" rel="noopener noreferrer"
                        className="hover:text-amber-600 transition underline underline-offset-2">
                        🔗 LinkedIn
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={closeBetaNotice}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 6px 20px rgba(234,88,12,0.3)" }}
                  >
                    Got it, let's go →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </>
  );
}

export default RoomView;