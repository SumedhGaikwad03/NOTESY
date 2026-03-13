/*import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true
      // "note_created"
      // "note_updated"
      // "note_deleted"
      // "member_added"
      // "member_removed"
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
      // could be noteId or userId depending on action
    },
    meta: {
      type: Object
      // optional: store title before/after, etc
    }
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);*/
