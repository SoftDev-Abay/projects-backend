import express from "express";
import { Attachment } from "../models/attachmentModel.js";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();
// Download Attachment File by Name

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get("/:file_name", async (req, res) => {
  try {
    const { file_name } = req.params;
    const attachment = await Attachment.findOne({
      file_name: file_name,
    });

    if (!attachment) {
      throw new Error("Attachment not found");
    }
    //fileSource from root directory of the project to the attachments folder  and the file source name
    const fileSource = path.join(
      __dirname,
      `../attachments/${attachment.file_source_name}`
    );

    // Send the file
    res.download(fileSource, attachment.file_name);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the router
export default router;
