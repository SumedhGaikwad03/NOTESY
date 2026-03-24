import { useState } from "react";

function CreateRoomModal({ show, onClose, onCreate }) {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || loading) return;
    setLoading(true);
    await onCreate(roomName);
    setRoomName("");
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .create-modal-enter { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .room-input {
          width: 100%; padding: 13px 16px; border-radius: 12px;
          border: 1.5px solid #fde68a; background: rgba(255,255,255,0.85);
          font-size: 14px; color: #1c1917; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .room-input:focus { border-color: #f97316; box-shadow: 0 0 0 4px rgba(251,146,60,0.15); }
        .room-input::placeholder { color: #a8a29e; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-sm {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 6px;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
        onClick={onClose}>

        <div className="create-modal-enter relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,253,245,0.97)",
            border: "1px solid rgba(253,230,138,0.6)",
            boxShadow: "0 24px 64px rgba(194,65,12,0.15)"
          }}
          onClick={(e) => e.stopPropagation()}>

          {/* Shimmer stripe */}
          <div style={{ height: "3px", background: "linear-gradient(90deg,#fbbf24,#f97316,#ea580c,#f97316,#fbbf24)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />

          <div className="p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-amber-800">
                  Create a Room
                </h2>
                <p className="text-xs text-amber-500 mt-0.5">Give your workspace a name</p>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 hover:bg-red-100 hover:text-red-500 transition flex items-center justify-center font-bold text-lg">
                ×
              </button>
            </div>

            <div className="mb-2">
              <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 block">
                Room name
              </label>
              <input
                type="text"
                placeholder="e.g. Design Sprint, Q4 Planning…"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                className="room-input"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 transition hover:bg-gray-200"
                style={{ background: "#f3f4f6" }}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !roomName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: roomName.trim() ? "0 4px 14px rgba(234,88,12,0.3)" : "none" }}>
                {loading ? <><span className="spinner-sm" />Creating…</> : "Create Room →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateRoomModal;