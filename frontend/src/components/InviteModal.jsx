import React from "react";

function InviteModal({ show, inviteEmail, setInviteEmail, onClose, onInvite, error }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Invite User</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Enter user email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        {error && (
  <p className="text-red-500 text-sm mb-2">{error}</p>
)}

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button> // this is a redundant button, we can remove it and just use the close button below 
          
          <button
            onClick={onInvite}
            disabled = {!inviteEmail.trim()}
           className="bg-amber-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Invite
          </button>
          <button onClick={() => { setInviteEmail(""); setShowInvite(false); }} className="bg-gray-500 text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InviteModal;
