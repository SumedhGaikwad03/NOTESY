import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import CreateRoomModal from "../components/CreateRoomModal";
import LeaveRoomModal from "../components/LeaveRoomModal";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [roomToLeave, setRoomToLeave] = useState(null);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  // Fix: read username inside useEffect so it's always fresh from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const createRoom = async (name) => {
    try {
      const res = await api.post("/rooms/create", { name });
      setRooms((prev) => [res.data, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Room creation failed:", err);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}/leave`);
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
      setShowLeaveModal(false);
    } catch (err) {
      console.error("Failed to leave room:", err);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/myrooms");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomClick = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  };

  // Soft warm colors for room cards
  const cardAccents = [
    { bg: "from-amber-100 to-yellow-50", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
    { bg: "from-orange-100 to-amber-50", dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700" },
    { bg: "from-yellow-100 to-lime-50", dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
    { bg: "from-rose-100 to-pink-50", dot: "bg-rose-400", badge: "bg-rose-100 text-rose-700" },
    { bg: "from-sky-100 to-blue-50", dot: "bg-sky-400", badge: "bg-sky-100 text-sky-700" },
    { bg: "from-violet-100 to-purple-50", dot: "bg-violet-400", badge: "bg-violet-100 text-violet-700" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 animate-pulse" />
          <p className="text-amber-700 font-medium text-sm tracking-wide">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 px-6 md:px-12 py-10">

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md shadow-lg shadow-amber-100/60 rounded-2xl px-6 py-4 mb-10 border border-white/60">

        {/* Left: logo + greeting */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-amber-200">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Notesy Workspace</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Welcome back,{" "}
              <span className="text-amber-600 font-semibold">
                {username || "Guest"}
              </span>
            </p>
          </div>
        </div>

        {/* Center: stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-amber-600">{rooms.length}</span>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider">Rooms</span>
          </div>
          <div className="h-8 w-px bg-gray-200 rounded-full" />
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-sm font-semibold text-emerald-600">Active</span>
            </span>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider">Status</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all shadow-md shadow-amber-200 active:scale-95"
          >
            <span className="text-base leading-none">+</span> New Room
          </button>
          <button className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 transition font-medium">
            Settings
          </button>
        </div>

      </header>

      {/* ── USER AVATAR BANNER ── */}
      {username && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow">
            {getInitials(username)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{username}</p>
            <p className="text-xs text-gray-400">Your rooms are listed below</p>
          </div>
        </div>
      )}

      {/* ── ROOMS GRID ── */}
      {rooms.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-16 text-center border border-white/50 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">
            📋
          </div>
          <h2 className="text-2xl font-bold text-gray-700">No rooms yet</h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Create your first room to start collaborating with your team.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all shadow-md shadow-amber-200"
          >
            + Create a Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => {
            const accent = cardAccents[index % cardAccents.length];
            return (
              <div
                key={room._id}
                onClick={() => handleRoomClick(room._id)}
                className={`bg-gradient-to-br ${accent.bg} rounded-2xl p-6 shadow-md border border-white/60 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between group`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${accent.dot} shadow-sm`} />
                    <h3 className="text-base font-bold text-gray-800 leading-tight">
                      {room.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoomToLeave(room._id);
                      setShowLeaveModal(true);
                    }}
                    className="text-xs px-2.5 py-1 bg-white/70 text-red-500 border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition font-medium"
                  >
                    Leave
                  </button>
                </div>

                {/* Card Body */}
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-5">
                  <span>👥</span>
                  <span>{room.members?.length || 1} collaborator{(room.members?.length || 1) !== 1 ? "s" : ""}</span>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-white/50">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${accent.badge}`}>
                    Collaborative
                  </span>
                  <span className="text-gray-400 text-sm group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALS ── */}
      <CreateRoomModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createRoom}
      />
      <LeaveRoomModal
        show={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onLeave={() => handleLeaveRoom(roomToLeave)}
      />
    </div>
  );
}

export default Rooms;