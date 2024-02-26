import mongoose from "mongoose";

const ChatroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const Chatroom = mongoose.model("Chatroom", ChatroomSchema);
