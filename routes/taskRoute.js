import express from "express";
import { Task } from "../models/taskModel.js";
import { Attachment } from "../models/attachmentModel.js";
import { User } from "../models/userModel.js";
import { Project } from "../models/projectModel.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

//  Add Task

router.post("/", uploadMiddleware, async (req, res) => {
  try {
    console.log("req.body", req.body);
    let {
      name,
      description,
      status,
      date_created,
      projectName,
      subtasks,
      members,
      ownerID,
    } = req.body;

    let attachmentsIds = [];

    if (req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          new Attachment({
            file_name: file.originalname,
            file_source_name: file.filename,
          })
            .save()
            .then((attachment) => {
              attachmentsIds.push(attachment._id);
            })
        )
      );
    }

    let projectId = await Project.findOne({ name: projectName }).select("_id");

    if (!projectId) {
      return res.status(404).json({ error: "Project not found" });
    }

    let memberIds = await User.find({
      username: { $in: members.map((member) => member) },
    }).select("_id");

    subtasks = JSON.parse(subtasks);

    const newTask = await Task.create({
      name,
      description,
      status,
      project: { project_id: projectId, name: projectName },
      date_created,
      subtasks: subtasks.map((subtask) => ({
        text: subtask.title,
        completed: subtask.completed,
      })),
      members: memberIds.map((memberId) => ({
        user_id: memberId,
        role: ownerID == memberId._id.toString() ? "owner" : "member",
      })),
      attachments: attachmentsIds,
    });

    // Assuming you have a way to handle file uploads and want to save them as attachments

    res
      .status(200)
      .json({ message: "Task adding successful", taskId: newTask._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// memeber rights - change subtasks
router.put("/subtasks/:task_id", async (req, res) => {
  try {
    const { task_id } = req.params;
    const { subtasks } = req.body;

    let task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.subtasks = subtasks.map((subtask) => ({
      text: subtask.text,
      completed: subtask.completed,
    }));

    await task.save();

    res.status(200).json({ message: "Task update successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update a task - admin

router.put("/:task_id", uploadMiddleware, async (req, res) => {
  try {
    const { task_id } = req.params;
    let {
      name,
      description,
      date_created,
      projectName,
      subtasks,
      members, // Assuming this is an array of usernames or identifiers to look up in the User collection
      deletedFiles,
      unchangedFiles,
    } = req.body;

    let project = await Project.findOne({ name: projectName });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const parsedDeletedFiles = JSON.parse(deletedFiles);
    const parsedUnchangedFiles = JSON.parse(unchangedFiles);

    let attachmentsIds = [];

    attachmentsIds = parsedUnchangedFiles.map((file) => file._id);

    // add new files to the database and save to the attachments array

    if (req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          new Attachment({
            file_name: file.originalname,
            file_source_name: file.filename,
          })
            .save()
            .then((attachment) => {
              attachmentsIds.push(attachment._id);
            })
        )
      );
    }

    //  delete deleted files

    if (parsedDeletedFiles) {
      await Promise.all(
        parsedDeletedFiles.map(async (file) => {
          const fileSource = `${__dirname}/attachments/${file.file_source_name}`;
          if (fs.existsSync(fileSource)) {
            fs.unlinkSync(fileSource);
          }
          await Attachment.deleteOne({ _id: file._id });
        })
      );
    }

    // Fetch member User documents based on the provided identifiers (username, etc.)
    let memberUsers = await User.find({
      username: { $in: members }, // Adjust based on how members are identified
    });

    let task = await Task.findByIdAndUpdate(
      task_id,
      {
        name,
        description,
        project: {
          project_id: project._id, // Fixed to match your schema's nested structure
          name: projectName,
        },
        date_created,
        subtasks: JSON.parse(subtasks).map((subtask) => ({
          text: subtask.text,
          completed: subtask.completed,
        })),
        members: memberUsers.map((user, index) => ({
          user: {
            user_id: user._id, // Corrected to match your schema's nested structure
            role: index === 0 ? "owner" : "member",
          },
        })),
        attachments: attachmentsIds,
      },
      { new: true }
    );

    // Handle file deletions and uploads as before...

    res.status(200).json({ message: "Task update successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get Tasks Where User is a Member/Admin

router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const tasks = await Task.find({ "members.user_id": user_id })
      .populate("project", "name")
      .lean();

    // Assuming you want to enrich tasks with counts
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        task.members_count = task.members.length;
        task.subtasks_count = task.subtasks.length;
        task.attachments_count = task.attachments ? task.attachments.length : 0;
        task.project_name = task.project.name; // Populated from project

        // determine current user role for the task

        const userRole = task.members.find(
          (member) => member.user_id.toString() === user_id
        ).role;

        task.task_user_role = userRole;

        return task;
      })
    );

    res.json(enrichedTasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//   Get Task by ID

router.get("/:task_id", async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = await Task.findById(task_id)
      .populate("members", "username role")
      .populate("project", "name")
      .populate("attachments", "file_name file_source_name")
      .lean();

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.project_name = task.project.name; // Populated from project
    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//   Update Task Status

router.put("/status/:task_id", async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      task_id,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Task

router.delete("/:task_id", async (req, res) => {
  try {
    const { task_id } = req.params;

    const task = await Task.findById(task_id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const attachments = await Attachment.find({ task: task_id });

    //  delete all attachments from the file system

    attachments.forEach(async (attachment) => {
      const fileSource = `${__dirname}/attachments/${attachment.file_source_name}`;
      if (fs.existsSync(fileSource)) {
        fs.unlinkSync(fileSource);
      }
      await attachment.remove();
    });

    // delete attachments from the database

    await Task.findByIdAndDelete(task_id);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

//  request body for adding a task with subtasks and members to test the task route

// {
//   "name":"Task 1",
//   "description":"This is the first task",
//   "status":"In Progress",
//   "date_created":"2022-10-10",
//   "projectName":"Project 1",
//   "subtasks":[
//     {
//       "title":"Subtask 1",
//       "completed":false
//     },
//     {
//       "title":"Subtask 2",
//       "completed":false
//     }
//   ],
//   "members":[
//     {
//       "username":"User 1",
//       "user_id":"65d9a35d3d42bee9a9002849"
//     },
//     {
//       "username":"User 2",
//       "user_id":"65d99df212290e7d67581336"
//     }
//   ]
// }
