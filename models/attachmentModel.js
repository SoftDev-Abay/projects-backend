import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  file_name: { type: String, required: true },
  file_source_name: { type: String, required: true },
});

export const Attachment = mongoose.model("Attachment", AttachmentSchema);
