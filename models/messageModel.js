import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chatroom",
    required: true,
  },
  text: { type: String, required: true },
  date: { type: Date, required: true },
});

export const Message = mongoose.model("Message", MessageSchema);
