import express from "express";
import { User } from "../models/userModel.js";
import uploadImageMiddleware from "../middlewares/uploadImageMiddleware.js";
const router = express.Router();

// Authenticate user
router.post("/auth", async (req, res) => {
  try {
    const { user_email, user_password } = req.body;
    const user = await User.findOne({
      email: user_email,
      password: user_password,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Create a user
router.post("/", async (req, res) => {
  try {
    const { user_email, username, user_password, admin } = req.body;
    const userEmailUnique = await User.findOne({ email: user_email });
    const userNameUnique = await User.findOne({ username: username });
    if (userEmailUnique) {
      res.status(400).json({ message: "Email already exists" });
    } else if (userNameUnique) {
      res.status(400).json({ message: "Username already exists" });
    } else {
      const newUser = await User.create({
        username,
        password: user_password,
        admin,
        email: user_email,
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update a user
router.put("/:user_id", uploadImageMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(user_id);

    const imageName = req.file.filename;

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      if (currentPassword !== user.password) {
        res.status(400).json({ message: "Incorrect password" });
      } else {
        user.username = username;
        user.email = email;
        user.password = newPassword;
        user.avatar_name = imageName;
        await user.save();
        res.json(user);
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, avatar_name: 1 });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
