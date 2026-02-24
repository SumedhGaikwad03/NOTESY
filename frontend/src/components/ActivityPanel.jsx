import React from "react";

function ActivityPanel({
  show,
  activity,
  onClose,
  renderActivityText
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      ></div>

      {/* Slide Panel */}
      <div className="relative w-96 bg-white shadow-2xl p-6 overflow-y-auto transition-transform duration-300 translate-x-0">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Activity Log</h2>
          <button
            onClick={onClose}
            className="text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {activity.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          activity.map(item => (
            <div
              key={item._id}
              className="mb-4 p-3 bg-gray-50 rounded-lg border"
            >
              <p className="text-sm">
                <span className="font-semibold">
                  {item.user?.username}
                </span>{" "}
                {renderActivityText(item)}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default ActivityPanel;
