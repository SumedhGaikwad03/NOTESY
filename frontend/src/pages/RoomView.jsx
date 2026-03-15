import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

import ActivityPanel from "../components/ActivityPanel";
import InviteModal from "../components/InviteModal";
import NoteEditorModal from "../components/NoteEditorModal";
import NoteCard from "../components/NoteCard";

import socket, { connectSocket } from "../sockets";
import { AnimatePresence, motion } from "framer-motion";

function RoomView() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [room, setRoom] = useState(null);
  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username");

  const [showEditor, setShowEditor] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  //const [showActivity, setShowActivity] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  //const [activity, setActivity] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});

  const [tasks, setTasks] = useState([]);
  const [inviteError, setInviteError] = useState("");
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  /* ── document title ── */
  useEffect(() => {
    if (room?.name) document.title = `${room.name} · Atrio`;
    return () => { document.title = "Atrio"; };
  }, [room?.name]);

  /* ── fetchers ── */
  const fetchNotes    = async () => { const r = await api.get(`/rooms/${roomId}/notes`);    setNotes(r.data); };
  const fetchRoom     = async () => { const r = await api.get(`/rooms/${roomId}`);           setRoom(r.data); };
 // const fetchActivity = async () => { const r = await api.get(`/rooms/${roomId}/activity`);  setActivity(r.data); };
  const fetchTasks    = async () => { const r = await api.get(`/rooms/${roomId}/tasks`);     setTasks(r.data); };

  const closeBetaNotice = () => {
    localStorage.setItem("atrio_beta_seen", "true");
    setShowBetaNotice(false);
  };

  /* ── note actions ── */
  const createNote = async () => {
    if (!title.trim() || !content.trim()) return;
    const tempId = "temp-" + Date.now();
    const optimisticNote = { _id: tempId, title: title.trim(), content: content.trim(), roomId, createdBy: { _id: currentUserId }, isOptimistic: true };
    setNotes(prev => [optimisticNote, ...prev]);
    setTitle(""); setContent(""); setShowEditor(false);
    try {
      const res = await api.post("/notes/add", { title, content, roomId });
      setNotes(prev => prev.map(n => n._id === tempId ? res.data : n));
    } catch (err) {
      console.error("Error creating note:", err);
      setNotes(prev => prev.filter(n => n._id !== tempId));
    }
  };

  const deleteNote = async (id) => {
    const prev = notes;
    setNotes(p => p.filter(n => n._id !== id));
    try { await api.delete(`/notes/delete/${id}`); /*fetchActivity(); */ }
    catch (err) { console.error(err); setNotes(prev); }
  };

  const saveEdit = async (id) => {
    const prev = notes;
    setNotes(p => p.map(n => n._id === id ? { ...n, title: editTitle, content: editContent } : n));
    setEditingId(null);
    try { await api.put(`/notes/update/${id}`, { title: editTitle, content: editContent }); /*fetchActivity(); */ }
    catch (err) { console.error(err); setNotes(prev); setEditingId(null); }
  };

  const addMember = async () => {
    try {
      setInviteError("");
      await api.put(`/rooms/${roomId}/add-member`, { userEmail: inviteEmail });
      setInviteEmail(""); setShowInvite(false);
      fetchRoom(); /*fetchActivity(); */
    } catch (err) { setInviteError(err.response?.data?.message || "Something went wrong."); }
  };

  /* ── socket ── */
  useEffect(() => {
    fetchNotes(); fetchRoom(); /*fetchActivity(); */ fetchTasks();
    connectSocket();
    const joinRoom = () => socket.emit("join_room", roomId); 
    if (!localStorage.getItem("atrio_beta_seen")) setShowBetaNotice(true);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("note_created", (note) => {
      setNotes(prev => {
        if (prev.some(n => n._id === note._id)) return prev;
        const opt = prev.find(n => n.isOptimistic && n.title === note.title);
        if (opt) return prev.map(n => n._id === opt._id ? note : n);
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
    socket.on("task_updated", (t) => setTasks(prev => prev.map(p => p._id === t._id ? t : p)));
    socket.on("task_deleted", (id) => setTasks(prev => prev.filter(t => String(t._id) !== String(id))));
    socket.on("online_users_update", setOnlineUsers);
    socket.on("note_editing_update", ({ noteId, userId, isEditing }) => {
      setEditingUsers(prev => {
        const u = { ...prev };
        if (isEditing) u[noteId] = userId; else delete u[noteId];
        return u;
      });
    });
    return () => { socket.emit("leave_room", roomId); socket.off(); };
  }, [roomId]);

  /* ── utils ── */
  const getRotation = (id) => {
    const seed = id.slice(-3);
    return ((parseInt(seed, 16) % 5) - 2) * 1.5;
  };

  const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : "?";

  /*const renderActivityText = (item) => {
    switch (item.type) {
      case "note_created": return `created note "${item.meta?.title}"`;
      case "note_updated": return `updated note "${item.meta?.title}"`;
      case "note_deleted": return `deleted note "${item.meta?.title}"`;
      case "member_added": return `added member "${item.meta?.username}"`;
      default: return `did something`;
    }
  };*/

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  /* ── render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .room-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        /* ── BLOBS ── */
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);}25%{transform:translate(50px,-60px) scale(1.08);}50%{transform:translate(-30px,50px) scale(0.95);}75%{transform:translate(60px,30px) scale(1.04);} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);}20%{transform:translate(-60px,40px) scale(1.06);}50%{transform:translate(40px,-60px) scale(0.93);}80%{transform:translate(-20px,-30px) scale(1.1);} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,60px) scale(1.12);}66%{transform:translate(-50px,-20px) scale(0.9);} }

        .blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
        .blob-1 { width:550px; height:550px; background:rgba(251,191,36,0.22); top:-180px; left:-180px; animation:blob1 14s ease-in-out infinite; }
        .blob-2 { width:550px; height:550px; background:rgba(249,115,22,0.18); bottom:-180px; right:-180px; animation:blob2 17s ease-in-out infinite; }
        .blob-3 { width:450px; height:450px; background:rgba(253,224,71,0.18); top:35%; left:45%; animation:blob3 11s ease-in-out infinite; }

        /* ── SHIMMER ── */
        @keyframes shimmer { 0%{background-position:-200% center;}100%{background-position:200% center;} }
        .header-shimmer {
          height: 3px;
          background: linear-gradient(90deg, #fbbf24, #f97316, #ea580c, #f97316, #fbbf24);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        /* ── HEADER ── */
        .room-header {
          position: relative;
          background: rgba(255,253,245,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(253,230,138,0.5);
          box-shadow: 0 2px 16px rgba(194,65,12,0.07);
          z-index: 20;
          overflow: hidden;
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 12px 24px;
        }

        /* left */
        .header-left { display:flex; align-items:center; gap:10px; flex-shrink:0; }

        .logo-mark {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(249,115,22,0.3);
        }
        .logo-mark span {
          font-family: 'Playfair Display', serif;
          font-weight: 800; font-size: 17px; color: white; line-height: 1;
        }
        .logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700;
          color: #1c1917; letter-spacing: -0.3px;
        }
        .logo-name em { font-style:normal; color:#f97316; }

        .beta-pill {
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
          padding: 3px 8px; border-radius: 99px;
          background: #f97316; color: white;
          cursor: pointer; transition: transform 0.15s;
          text-transform: uppercase;
        }
        .beta-pill:hover { transform: scale(1.05); }

        .back-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 10px;
          border: 1px solid rgba(253,230,138,0.6);
          background: rgba(255,255,255,0.6);
          color: #92400e; font-size: 12px; font-weight: 500;
          cursor: pointer; transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .back-btn:hover { background: rgba(255,255,255,0.9); transform: translateX(-1px); }

        .vdivider { width:1px; height:24px; background:rgba(253,230,138,0.7); flex-shrink:0; }

        .room-name-badge {
          padding: 5px 13px; border-radius: 10px;
          font-size: 13px; font-weight: 600; color: #92400e;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #fcd34d;
          max-width: 180px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        /* center */
        .header-center {
          flex: 1; display:flex; justify-content:center;
          overflow: hidden; padding: 0 12px;
        }
        .members-row {
          display: flex; align-items: center; gap: 6px;
          overflow-x: auto; scrollbar-width: none;
        }
        .members-row::-webkit-scrollbar { display:none; }

        .member-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #fcd34d; border-radius: 99px;
          font-size: 12px; font-weight: 500; color: #78350f;
          white-space: nowrap; flex-shrink: 0;
          transition: box-shadow 0.2s;
        }
        .member-chip:hover { box-shadow: 0 2px 8px rgba(251,191,36,0.4); }
        .online-dot { width:7px; height:7px; border-radius:50%; background:#34d399; flex-shrink:0; }

        /* right */
        .header-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

        .user-avatar-sm {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
          flex-shrink: 0;
        }

        .online-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 99px;
          background: #dcfce7; color: #166534;
          font-size: 11px; font-weight: 600;
        }
        .online-pulse { width:6px; height:6px; border-radius:50%; background:#34d399; animation:pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.3;} }

        .hbtn {
          padding: 6px 13px; border-radius: 10px; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .hbtn:hover { transform: translateY(-1px); }
        .hbtn:active { transform: scale(0.97); }
        .hbtn-tasks    { background: #eef2ff; color: #4338ca; }
        .hbtn-tasks.active { background: #e0e7ff; }
        .hbtn-activity { background: #f3f4f6; color: #374151; }
        .hbtn-invite   { background: linear-gradient(135deg,#f97316,#ea580c); color:white; box-shadow:0 3px 10px rgba(234,88,12,0.28); }
        .hbtn-contact  { background: rgba(255,255,255,0.6); color: #a8a29e; border: 1px solid rgba(228,228,231,0.8); font-size:11px; }
        .hbtn-contact:hover { color: #78716c; background: rgba(255,255,255,0.9); }

        /* ── TASK SIDEBAR ── */
        .task-sidebar {
          position: fixed; inset-y: 0; left: 0;
          width: 320px; z-index: 40;
          display: flex; flex-direction: column;
          background: rgba(255,253,245,0.97);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(253,230,138,0.5);
          box-shadow: 4px 0 32px rgba(194,65,12,0.08);
        }
        .sidebar-header {
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(253,230,138,0.4);
        }
        .sidebar-title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .sidebar-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #92400e;
        }
        .sidebar-close {
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(251,191,36,0.15); border: none;
          color: #92400e; font-size: 16px; font-weight: 700;
          cursor: pointer; display:flex; align-items:center; justify-content:center;
          transition: background 0.15s;
        }
        .sidebar-close:hover { background: rgba(220,38,38,0.12); color: #dc2626; }

        .task-count-badge {
          font-size: 11px; font-weight: 600; color: #f97316;
          padding: 2px 8px; border-radius: 99px;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2);
        }

        /* progress bar */
        .progress-track {
          height: 5px; border-radius: 99px;
          background: rgba(253,230,138,0.4);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #fbbf24, #f97316);
          transition: width 0.4s ease;
        }
        .progress-label {
          font-size: 10px; color: #a8a29e; margin-top: 5px;
          display: flex; justify-content: space-between;
        }

        .task-list { flex:1; overflow-y:auto; padding:12px 14px; scrollbar-width:none; }
        .task-list::-webkit-scrollbar { display:none; }

        .task-card {
          display: flex; align-items: flex-start;
          padding: 11px 13px; border-radius: 13px; margin-bottom: 8px;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(253,230,138,0.5);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .task-card:hover { box-shadow: 0 3px 10px rgba(251,191,36,0.2); transform: translateY(-1px); }

        .task-input {
          width: 100%; padding: 10px 13px; border-radius: 11px;
          border: 1.5px solid #fde68a;
          background: rgba(255,255,255,0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #1c1917; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .task-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .task-input::placeholder { color: #a8a29e; }

        /* ── BOARD ── */
        .notes-board { padding: 28px 28px 100px; }

        .board-meta {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
        }
        .note-count {
          font-size: 11px; font-weight: 600; color: #a8a29e;
          text-transform: uppercase; letter-spacing: 0.07em;
        }

        /* empty state */
        .empty-board {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 24px; text-align: center;
        }
        .empty-icon-wrap {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.1));
          border: 1px solid rgba(251,191,36,0.3);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }

        /* FAB */
        .fab {
          position: fixed; bottom: 32px; right: 32px;
          width: 58px; height: 58px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; border: none; border-radius: 50%;
          font-size: 28px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(234,88,12,0.4);
          z-index: 15;
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="room-root"
        style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 35%,#fff7ed 65%,#ffedd5 100%)", position: "relative", overflowX: "hidden" }}
      >

        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

          {/* ── HEADER ── */}
          <div className="room-header">
            <div className="header-shimmer" />
            <div className="header-inner">

              {/* Left */}
              <div className="header-left">
                <div className="logo-mark"><span>A</span></div>
                <div className="logo-name">Atri<em>o</em></div>
                <span className="beta-pill" onClick={() => setShowBetaNotice(true)}>BETA</span>

                <div className="vdivider" />

                <button className="back-btn" onClick={() => navigate("/rooms")}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Rooms
                </button>

                <div className="vdivider" />

                <div className="room-name-badge">{room?.name || "Loading…"}</div>
              </div>

              {/* Center — members */}
              <div className="header-center">
                <div className="members-row">
                  {room?.members?.map(member => {
                    const isOnline = onlineUsers.includes(String(member._id));
                    return (
                      <div key={member._id} className="member-chip">
                        <span>{member.username}</span>
                        {isOnline && (
                          <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="online-dot"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right */}
              <div className="header-right">
                <div className="user-avatar-sm">{getInitials(currentUsername)}</div>

                <div className="online-badge">
                  <span className="online-pulse" />
                  {onlineUsers.length} online
                </div>

                <button
                  className={`hbtn hbtn-tasks ${showTasks ? "active" : ""}`}
                  onClick={() => setShowTasks(p => !p)}
                >☑ Tasks</button>

                {/* <button className="hbtn hbtn-activity" onClick={() => setShowActivity(true)}>
                  Activity
                </button> */}

                <button className="hbtn hbtn-invite" onClick={() => setShowInvite(true)}>
                  + Invite
                </button>

                <button className="hbtn hbtn-contact" onClick={() => setShowBetaNotice(true)}>
                  Contact
                </button>
              </div>

            </div>
          </div>

          {/* ── LAYOUT ── */}
          <div style={{ display: "flex", flex: 1 }}>

            {/* TASK SIDEBAR */}
            <AnimatePresence>
              {showTasks && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowTasks(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", backdropFilter: "blur(2px)", zIndex: 30 }}
                  />
                  <motion.div
                    initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }}
                    transition={{ type: "spring", stiffness: 280, damping: 32 }}
                    className="task-sidebar"
                  >
                    {/* Sidebar header */}
                    <div className="sidebar-header">
                      <div className="sidebar-title-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "3px", height: "22px", borderRadius: "99px", background: "linear-gradient(to bottom,#fbbf24,#f97316)" }} />
                          <span className="sidebar-title">
                            Tasks{room?.name ? ` · ${room.name}` : ""}
                          </span>
                          <span className="task-count-badge">{tasks.filter(t => !t.completed).length} left</span>
                        </div>
                        <button className="sidebar-close" onClick={() => setShowTasks(false)}>×</button>
                      </div>

                      {/* Progress bar */}
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${taskProgress}%` }} />
                      </div>
                      <div className="progress-label">
                        <span>{completedTasks} done</span>
                        <span>{totalTasks} total</span>
                      </div>
                    </div>

                    {/* Task list */}
                    <div className="task-list">
                      {[...tasks.filter(t => !t.completed), ...tasks.filter(t => t.completed)].map(task => (
                        <div key={task._id} className={`task-card ${task.completed ? "" : ""}`} style={{ opacity: task.completed ? 0.6 : 1 }}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            style={{ marginTop: "2px", accentColor: "#f97316", width: "15px", height: "15px", cursor: "pointer", flexShrink: 0 }}
                            onChange={async () => {
                              if (task.isOptimistic) return;

                              const updated = !task.completed;

                              setTasks(prev =>
                                prev.map(t =>
                                  t._id === task._id
                                    ? { ...t, completed: updated, isOptimistic: true }
                                    : t
                                )
                              );

                              try {
                                await api.put(`/rooms/${roomId}/tasks/${task._id}`, { completed: updated });

                                setTasks(prev =>
                                  prev.map(t =>
                                    t._id === task._id
                                      ? { ...t, isOptimistic: false }
                                      : t
                                  )
                                );

                              } catch {

                                setTasks(prev =>
                                  prev.map(t =>
                                    t._id === task._id
                                      ? { ...t, completed: !updated, isOptimistic: false }
                                      : t
                                  )
                                );

                              }
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0, marginLeft: "10px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.4, color: task.completed ? "#a8a29e" : "#1c1917", textDecoration: task.completed ? "line-through" : "none", marginBottom: "3px" }}>
                              {task.text}
                            </p>
                            {task.createdBy?.username && (
                              <p style={{ fontSize: "10px", color: "#f97316", fontWeight: 500 }}>{task.createdBy.username}</p>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              const id = task._id;
                              setTasks(prev => prev.filter(t => t._id !== id));
                              if (task.isOptimistic) return;
                              try { await api.delete(`/rooms/${roomId}/tasks/${id}`); }
                              catch { fetchTasks(); }
                            }}
                            style={{ marginLeft: "8px", width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "transparent", color: "#d4c5b0", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
                            onMouseEnter={e => { e.target.style.background = "#fee2e2"; e.target.style.color = "#dc2626"; }}
                            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#d4c5b0"; }}
                          >×</button>
                        </div>
                      ))}

                      {tasks.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#d4c5b0" }}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 10px" }}>
                            <rect x="6" y="4" width="20" height="24" rx="4" stroke="#fde68a" strokeWidth="1.5"/>
                            <path d="M11 12h10M11 16h7M11 20h5" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="23" cy="23" r="5" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5"/>
                            <path d="M21 23l1.5 1.5L25 21" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p style={{ fontSize: "12px" }}>No tasks yet</p>
                        </div>
                      )}
                    </div>

                    {/* Add task */}
                    <div style={{ padding: "12px 14px 18px", borderTop: "1px solid rgba(253,230,138,0.4)" }}>
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
              animate={{ marginLeft: showTasks ? 320 : 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              style={{ flex: 1 }}
            >
              <div className="notes-board">

                {/* board meta */}
                {notes.length > 0 && (
                  <div className="board-meta">
                    <span className="note-count">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(253,230,138,0.5), transparent)" }} />
                  </div>
                )}

                {/* notes */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "flex-start" }}>
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
                </div>

                {/* empty state */}
                {notes.length === 0 && (
                  <div className="empty-board">
                    <div className="empty-icon-wrap">
                      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                        <rect x="5" y="3" width="24" height="28" rx="5" stroke="#fbbf24" strokeWidth="1.5"/>
                        <path d="M11 11h12M11 16h9M11 21h6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="26" cy="26" r="6" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
                        <path d="M24 26l1.5 1.5L28 24" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: 700, color: "#1c1917", marginBottom: "8px" }}>No notes yet</p>
                    <p style={{ fontSize: "13px", color: "#a8a29e", maxWidth: "220px", lineHeight: 1.6 }}>
                      Hit the <strong style={{ color: "#f97316" }}>+</strong> button to add your first note to this room.
                    </p>
                  </div>
                )}
              </div>

              {/* FAB */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 8 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowEditor(true)}
                className="fab"
              >+</motion.button>

            </motion.div>
          </div>
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
        {/* <ActivityPanel
          show={showActivity} activity={activity}
          onClose={() => setShowActivity(false)} renderActivityText={renderActivityText}
        />

        {/* ── BETA / WELCOME MODAL ── */}
        <AnimatePresence>
          {showBetaNotice && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "24px", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                style={{ width: "100%", maxWidth: "440px", borderRadius: "24px", overflow: "hidden", background: "rgba(255,253,245,0.98)", border: "1px solid rgba(253,230,138,0.6)", boxShadow: "0 24px 64px rgba(194,65,12,0.15)" }}
              >
                <div style={{ height: "3px", background: "linear-gradient(90deg,#fbbf24,#f97316,#ea580c,#f97316,#fbbf24)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

                <div style={{ padding: "32px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>Welcome to Atrio</h2>
                      <p style={{ fontSize: "10px", color: "#f97316", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Early Access</p>
                    </div>
                    <span className="beta-pill" onClick={() => setShowBetaNotice(false)}>BETA</span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#57534e", lineHeight: 1.7, marginBottom: "10px" }}>
                    You're using an early version of Atrio. Create rooms, collaborate in real‑time, and manage notes together inside shared spaces.
                  </p>
                  <p style={{ fontSize: "13px", color: "#a8a29e", lineHeight: 1.7, marginBottom: "20px" }}>
                    We're actively improving the experience. If something feels off, that insight helps shape the product.
                  </p>

                  <div style={{ padding: "16px", borderRadius: "14px", background: "#fef9e7", border: "1px solid #fde68a", marginBottom: "20px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Feedback & suggestions</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <a href="mailto:SumedhGaikwad.dev@gmail.com" style={{ fontSize: "12px", color: "#a8a29e", textDecoration: "underline", textUnderlineOffset: "3px", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color="#f97316"} onMouseLeave={e => e.target.style.color="#a8a29e"}>
                        ✉ SumedhGaikwad.dev@gmail.com
                      </a>
                      <a href="https://www.linkedin.com/in/sumedh-gaikwad-8b95292a6" target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "12px", color: "#a8a29e", textDecoration: "underline", textUnderlineOffset: "3px", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color="#f97316"} onMouseLeave={e => e.target.style.color="#a8a29e"}>
                        🔗 LinkedIn
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={closeBetaNotice}
                    style={{ width: "100%", padding: "13px", borderRadius: "13px", border: "none", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 6px 20px rgba(234,88,12,0.3)", transition: "transform 0.15s, box-shadow 0.15s" }}
                    onMouseEnter={e => { e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 10px 28px rgba(234,88,12,0.4)"; }}
                    onMouseLeave={e => { e.target.style.transform=""; e.target.style.boxShadow="0 6px 20px rgba(234,88,12,0.3)"; }}
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