import mongoose from "mongoose";

// Define schema for Projects
const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date_created: { type: Date, required: true },
  date_due: { type: Date },
  category: { type: String, required: true },
  imgUrls: [{ type: String }],
  members: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, default: "Member" },
    },
  ],
  bannerImgs: [{ type: String }],
});

export const Project = mongoose.model("Project", ProjectSchema);
