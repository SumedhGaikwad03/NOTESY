import React from "react";
// redunadt old componet
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
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(2px)"
        }}
      />

      {/* Slide Panel */}
      <div
        style={{
          width: "340px",
          background: "#fff",
          borderLeft: "1px solid rgba(253,230,138,0.4)",
          boxShadow: "-10px 0 25px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10
        }}
      >

        {/* Header */}
        <div
          style={{
            padding: "16px 16px 12px",
            borderBottom: "1px solid rgba(253,230,138,0.4)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              
              <div
                style={{
                  width: "3px",
                  height: "22px",
                  borderRadius: "99px",
                  background: "linear-gradient(to bottom,#fbbf24,#f97316)"
                }}
              />

              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1c1917"
                }}
              >
                Activity
              </span>

            </div>

            <button
              onClick={onClose}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
                color: "#d4c5b0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s, color 0.15s"
              }}
              onMouseEnter={e => {
                e.target.style.background = "#fee2e2";
                e.target.style.color = "#dc2626";
              }}
              onMouseLeave={e => {
                e.target.style.background = "transparent";
                e.target.style.color = "#d4c5b0";
              }}
            >
              ×
            </button>

          </div>
        </div>

        {/* Activity List */}
        <div style={{ padding: "12px 14px", overflowY: "auto", flex: 1 }}>

          {activity.length === 0 ? (

            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#d4c5b0",
                fontSize: "12px"
              }}
            >
              No activity yet
            </div>

          ) : (

            activity.map(item => (
              <div
                key={item._id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "#fffbeb",
                  border: "1px solid rgba(253,230,138,0.5)",
                  marginBottom: "10px"
                }}
              >

                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.4,
                    color: "#1c1917"
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#f97316"
                    }}
                  >
                    {item.user?.username}
                  </span>{" "}
                  {renderActivityText(item)}
                </p>

                <p
                  style={{
                    fontSize: "10px",
                    color: "#a8a29e",
                    marginTop: "4px"
                  }}
                >
                  {new Date(item.createdAt).toLocaleString()}
                </p>

              </div>
            ))

          )}

        </div>

      </div>
    </div>
  );
}

export default ActivityPanel;