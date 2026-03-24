function LeaveRoomModal({ show, onClose, onLeave }) {
  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .leave-modal-enter { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
        onClick={onClose}>

        <div className="leave-modal-enter relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,253,245,0.97)",
            border: "1px solid rgba(253,230,138,0.6)",
            boxShadow: "0 24px 64px rgba(194,65,12,0.15)"
          }}
          onClick={(e) => e.stopPropagation()}>

          {/* Red warning stripe */}
          <div style={{ height: "3px", background: "linear-gradient(90deg, #fca5a5, #ef4444, #dc2626, #ef4444, #fca5a5)" }} />

          <div className="p-7">
            {/* Icon + title */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#fee2e2,#fecaca)", border: "1px solid #fca5a5" }}>
                <span className="text-xl">🚪</span>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-gray-800">
                  Leave Room?
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone easily</p>
              </div>
            </div>

            {/* Warning list */}
            <div className="rounded-xl p-4 mb-6 text-sm space-y-2"
              style={{ background: "#fff7ed", border: "1px solid #fde68a" }}>
              {[
                "You'll lose access to all notes in this room",
                "You'll stop receiving real-time updates",
                "You'll need a new invite to rejoin",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-800">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-xs leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 transition hover:bg-gray-200"
                style={{ background: "#f3f4f6" }}>
                Stay
              </button>
              <button onClick={onLeave}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }}>
                Leave Room →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeaveRoomModal;