import express from "express";
import { User } from "../models/userModel.js";
import uploadImageMiddleware from "../middlewares/uploadImageMiddleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

// Authenticate user
router.post("/auth", async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const user = await User.findOne({ email: user_email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the hashed password.
    const isMatch = await bcrypt.compare(user_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { user_id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30min" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true });

    console.log(accessToken);

    res.status(200).json({ accessToken, user });
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
      return res.status(400).json({ message: "Email already exists" });
    } else if (userNameUnique) {
      return res.status(400).json({ message: "Username already exists" });
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user_password, salt);

      const newUser = await User.create({
        username,
        password: hashedPassword,
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Hash the new password if it's being changed
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    user.username = username;
    user.email = email;
    const imageName = req.file ? req.file.filename : user.avatar_name; // Use existing avatar_name if no new file
    user.avatar_name = imageName;

    await user.save();
    res.json(user);
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
