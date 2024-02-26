import multer from "multer";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storageAttachments = multer.diskStorage({
  destination: (req, file, cb) => {
    const attachmentsPath = path.join(__dirname, "../attachments");
    cb(null, attachmentsPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadAttachment = multer({ storage: storageAttachments });

// Custom file upload middleware
const uploadMiddleware = (req, res, next) => {
  // Use multer upload instance
  console.log("uploadMiddleware");
  uploadAttachment.array("files", 5)(req, res, (err) => {
    if (err) {
      console.log("error uploadMiddleware", err);
      return res.status(400).json({ error: err.message });
    }

    // Retrieve uploaded files
    const files = req.files;
    const errors = [];

    // Validate file types and sizes
    files.forEach((file) => {
      const allowedTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.originalname}`);
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    // Handle validation errors
    if (errors.length > 0) {
      // Remove uploaded files
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      console.log(errors);

      return res.status(400).json({ errors });
    }

    console.log("success uploadMiddleware");
    console.log("files", files);

    // Attach files to the request object
    req.files = files;

    // Proceed to the next middleware or route handler
    next();
  });
};

export default uploadMiddleware;
