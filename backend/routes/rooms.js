import express from 'express';
import Room from '../models/room.js';
import Note from '../models/note.js';
import authMiddleware from '../middleware/auth.js';
import mongoose from 'mongoose';
import User from '../models/User_Model.js';
import Activity from '../models/activity.js';
import { getIO } from "../socket.js";



const router = express.Router();


// we are now creating a room 
router.post('/create', authMiddleware, async (req, res) => {

  try {

    const { name } = req.body;

    // checking if room name is empty or contains only spaces
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Room name cannot be empty"
      });
    }

    const room = new Room({
      name,
      createdBy: req.userId, // we are getting user id from token and then we are using that user id to create a room for that user only
      members: [req.userId] // when a room is created the creator is also a member of that room so we are adding that user id to members array
    });

    await room.save(); // saving room to mongodb

    console.log("Room created");
    console.log("req.userId:", req.userId);
    console.log("Type of req.userId:", typeof req.userId);
  

    res.status(201).json(room); // sending created room back to frontend

  } catch (error) {

    console.error("Error creating room:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});


// we are now fetching all rooms that the logged in user is a member of
router.get('/myrooms', authMiddleware, async (req, res) => {

  try {

    const rooms = await Room.find({
      members: req.userId // we are finding rooms where members array contains user id that we are getting from token and then we are sending those rooms to frontend
    });

    console.log("Rooms fetched");

    res.status(200).json(rooms); // sending all rooms to frontend

  } catch (error) {

    console.error("Error fetching rooms:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});


// we are now fetching all notes that belong to a specific room
router.get('/:roomId/notes', authMiddleware, async (req, res) => {

  try {

    const { roomId } = req.params;

    // checking if user is a member of the room before allowing access to notes
    const room = await Room.findOne({
      _id: roomId,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({
        message: "Access denied to this room"
      });
    }

    // fetching all notes that belong to this room sorted by newest first
    const notes = await Note.find({
      room: roomId
    }).sort({ createdAt: -1 });

    res.json(notes); // sending notes to frontend

  } catch (error) {

    console.error("Error fetching notes:", error);

    res.status(500).json({
      message: "Error fetching notes"
    });

  }

  // GET SINGLE ROOM DETAILS



});
// GET SINGLE ROOM DETAILS
router.get("/:roomId", authMiddleware, async (req, res) => {

  try {

    const { roomId } = req.params;

    const room = await Room.findOne({
      _id: roomId,
      members: req.userId
    }).populate("members", "username");

    if (!room) {

      return res.status(404).json({
        message: "Room not found or access denied"
      });

    }

    res.status(200).json(room);

  } catch (error) {

    console.error("Error fetching room:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }



});

// ADD MEMBER TO ROOM
router.put("/:roomId/add-member", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userEmail } = req.body;

    const io = getIO(); // declare once

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (room.members.includes(user._id)) {
      return res.status(400).json({ message: "User already in room" });
    }

    await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: user._id } },
      { new: true }
    );

    const activity = await Activity.create({
      room: roomId,
      user: req.userId,
      type: "member_added",
      targetId: user._id,
      meta: { username: user.username }
    });

    const roomKey = roomId.toString();

    io.to(roomKey).emit("member_added", {
      userId: user._id,
      username: user.username
    });

    io.to(roomKey).emit("activity_update", activity);

    res.json({ message: "Member added successfully" });

  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//remove member from room
router.delete("/:roomId/leave", authMiddleware, async (req, res) => {
   const { roomId } = req.params;
    const userId = req.userId;
  try {
   const room = await Room.findById(roomId);
    if (!room.members.includes(userId)) {
  return res.status(403).json({ message: "You are not a member of this room" });
}

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.members = room.members.filter(
      member => member.toString() !== userId
    );

    const io = getIO();
    io.to(roomId).emit("memberLeft", { roomId, userId });

     // if no members left → delete room
    if (room.members.length === 0) {
      await Room.findByIdAndDelete(roomId);
      return res.json({ message: "Room deleted (last member left)" });
    }


    await room.save();

    res.json({ message: "Left room successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
 


// route for activity logs 
router.get("/:roomId/activity", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      _id: roomId,
      members: req.userId
    });

    if (!room) {
      return res.status(403).json({ message: "Access denied" });
    }

    const activity = await Activity.find({ room: roomId })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activity);

  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});







export default router;
