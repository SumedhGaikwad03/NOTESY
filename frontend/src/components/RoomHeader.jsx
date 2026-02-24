import React from "react";

function RoomHeader({ room, onInvite, onShowActivity, onlineUsers = [] }) {
  return (
    <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md">

      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-amber-700">
          Notesy
        </h1>

        <div className="bg-yellow-100 px-4 py-2 rounded-lg shadow">
          {room?.name}
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto max-w-md">
        {room?.members?.map(member => {
          const isOnline = onlineUsers.includes(String(member._id));

          return (
            <div
              key={member._id}
              className="px-3 py-1 bg-amber-200 rounded-full text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300"
            >
              <span>{member.username}</span>

              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isOnline
                    ? "bg-green-500 scale-110 shadow-md shadow-green-300"
                    : "bg-gray-400 opacity-60"
                }`}
              />
            </div>
          );
        })}

        <button
          onClick={onInvite}
          className="px-3 py-1 bg-gray-300 rounded-full"
        >
          +
        </button>

        <button
          onClick={onShowActivity}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Activity
        </button>
      </div>
    </div>
  );
}

export default RoomHeader;
