import express from "express";

const router = express.Router();

// Import the models

import { Chatroom } from "../models/chatRoomModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";

// {
//   "id": 3,
//   "name": "bau,abay",
//   "members": [
//       {
//           "id": 6,
//           "username": "bau",
//           "password": "0",
//           "admin": false,
//           "email": "bau@emai",
//           "avatar_name": null
//       },
//       {
//           "id": 1,
//           "username": "abay",
//           "password": "1234",
//           "admin": true,
//           "email": "abay@email",
//           "avatar_name": null
//       }
//   ]
// }

// Create a chatroom
router.post("/chats", async (req, res) => {
  try {
    const { users } = req.body; // Assuming users contains user usernames
    if (users.length === 0) {
      return res.status(404).json({ message: "No users selected" });
    } else if (users.length === 2) {
      const name = users.join(",");
      let chatroom = await Chatroom.findOne({ name });
      if (chatroom) {
        return res.json(chatroom);
      } else {
        let membersData = await Promise.all(
          users.map((username) => User.findOne({ username }).select("_id"))
        );

        console.log(membersData);
        const chatroom = await Chatroom.create({
          name,
          members: membersData,
        });

        // get the chatroom with its members populated

        const chatroomWithMembers = await Chatroom.findById(chatroom._id)
          .populate("members", "username avatar_name _id")
          .lean();

        console.log(chatroomWithMembers);
        // const response = {
        //   _id: chatroom._id,
        //   name: chatroom.name,
        //   members: membersData,
        // };

        return res.json(chatroomWithMembers);
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//  store a message

router.post("/messages", async (req, res) => {
  try {
    const { chatroom_id, sender_id, text, date } = req.body;
    const newMessage = await Message.create({
      chatroom: chatroom_id,
      sender: sender_id,
      text,
      date,
    });
    res.json(newMessage);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//    Get Chatroom Messages

router.post("/chats/messages", async (req, res) => {
  try {
    const { chatID } = req.body;
    const messages = await Message.find({ chatroom: chatID })
      .populate("sender", "username")
      .lean(); // Assuming you want sender info
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Chatrooms Where User is a Member

router.get("/user_chatrooms/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const userChatrooms = await Chatroom.find({ members: user_id })
      .populate("members", "username")
      .lean(); // Assuming you want member info
    res.json(userChatrooms);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the router
export default router;
