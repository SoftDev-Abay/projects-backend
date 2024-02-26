import express from "express";
import { Project } from "../models/projectModel.js";
import { User } from "../models/userModel.js";
const router = express.Router();

// "name":"cashproject",
// "description":"dashboard project",
// "date_created":"12-10-2023",
// "date_due":"12-10-2024",
// "category":"finance",
// "members":[
//   {
//     "user_id":"65d99ea712290e7d6758133e",
//     "role":"Owner"
//   },
//   {
//     "user_id":"65d9a35d3d42bee9a9002849",
//     "role":"Owner"
//   },

// ]

// Add project
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      date_created,
      date_due,
      category,
      members,
      banner_imgs,
    } = req.body;

    console.log(banner_imgs);

    const membersIds = await User.find({
      username: { $in: members.map((member) => member.username) },
    }).select("_id");

    console.log(membersIds);
    console.log(members);

    const membersWithIds = members.map((member, index) => {
      const memberWithId = membersIds[index];
      return {
        user_id: memberWithId._id,
        role: member.role,
      };
    });

    const newProject = await Project.create({
      name,
      description,
      date_created,
      date_due,
      category,
      members: membersWithIds,
      bannerImgs: banner_imgs,
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get projects where user is a member
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const userProjects = await Project.find({
      "members.user_id": user_id,
    }).populate("members.user_id", "username avatar_name");

    const formattedProjects = userProjects.map((project) => {
      return {
        id: project._id,
        name: project.name,
        description: project.description,
        date_created: project.date_created,
        date_due: project.date_due,
        category: project.category,
        bannerImgs: project.bannerImgs,
        members: project.members.map((member) => ({
          user_id: member.user_id._id,
          username: member.user_id.username,
          avatar_name: member.user_id.avatar_name,
          role: member.role,
        })),
      };
    });

    res.json(formattedProjects);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
