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
  const[roomToLeave, setRoomToLeave] = useState(null);

  const navigate = useNavigate();

  const createRoom = async (name) => {
    try {
      const res = await api.post("/rooms/create", { name });
      setRooms(prev => [res.data, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Room creation failed:", err);
    }
  };

  const handleLeaveRoom = async (roomId,userId)  =>{
    try {
      await api.delete(`/rooms/${roomId}/leave`); 
      setRooms(prev => prev.filter(room => room._id !== roomId));
      setShowLeaveModal(false);
    } catch (err){
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

 // const handelExitRoom = async (roomId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your workspace...
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 px-10 py-14">

      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-amber-700 tracking-tight">
            Your Workspace
          </h1>
          <p className="text-gray-600 mt-2">
            Pick a room and start building together
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-300/40 active:scale-95"
        >
          + New Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-14 text-center border border-white/40">
          <h2 className="text-2xl font-semibold text-gray-700">
            No rooms yet
          </h2>
          <p className="text-gray-500 mt-3">
            Create your first collaborative whiteboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

  {rooms.map((room) => (
    <div
      key={room._id}
      onClick={() => handleRoomClick(room._id)}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-white/40 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-200/40 flex flex-col justify-between"
    >

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {room.name}
        </h3>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setRoomToLeave(room._id);
            setShowLeaveModal(true);
          }}
          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
        >
          Leave
        </button>
      </div>

      {/* Body */}
      <p className="text-gray-500 text-sm">
        {room.members?.length || 1} collaborators
      </p>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center">
        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
          Collaborative
        </span>

        <span className="text-gray-400 text-sm">
          Open →
        </span>
      </div>

    </div>
  ))}

</div>
      )}

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
