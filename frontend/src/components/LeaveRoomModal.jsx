import { useNavigate } from "react-router-dom";

function LeaveRoomModal({ show, onClose, onLeave }) {

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[420px] bg-white rounded-xl shadow-2xl p-6 z-10">

        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Leave Room
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Are you sure you want to leave this room?
        </p>

        <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
          If you leave:
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>You will lose access to all notes in this room</li>
            <li>You will stop receiving updates</li>
            <li>You will need a new invite to rejoin</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={onLeave}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
          >
            Leave Room
          </button>

        </div>

      </div>
    </div>
  );
}

export default LeaveRoomModal;