import mongoose from "mongoose";

// Define schema for Users
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  email: { type: String, required: true },
  avatar_name: { type: String },
});

export const User = mongoose.model("User", UserSchema);
