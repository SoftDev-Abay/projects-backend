import express from "express";
import { Attachment } from "../models/attachmentModel.js";

const router = express.Router();
// Download Attachment File by Name

router.get("/:file_name", async (req, res) => {
  try {
    const { file_name } = req.params;
    const attachment = await Attachment.findOne({
      file_source_name: file_name,
    });

    if (!attachment) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileSource = `${__dirname}/attachments/${file_name}`;
    res.download(fileSource, attachment.file_name);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the router
export default router;
