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
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Modal */}
     <div className="relative bg-white rounded-2xl p-8 w-full max-w-md 
                shadow-2xl animate-modal">


        <h2 className="text-2xl font-bold text-amber-700 mb-4">
          Create New Room
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition-all duration-200 active:scale-95"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal;
