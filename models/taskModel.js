import mongoose from "mongoose";

// Define schema for Tasks
const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String },
  project: {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: { type: String, required: true },
  },
  date_created: { type: Date, required: true },
  subtasks: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
  members: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: { type: String, default: "member" },
    },
  ],
  attachments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attachment",
      required: true,
    },
  ],
});

// Create a model for Tasks
export const Task = mongoose.model("Task", TaskSchema);
