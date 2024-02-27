import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";
import taskRoute from "./routes/taskRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import attachmentRoute from "./routes/attachmentRoute.js";
import jobsRoute from "./routes/jobsRoute.js";
import quoteRoute from "./routes/quoteRoutes.js";
import jokeRoute from "./routes/jokeRoutes.js";
import headlinesRoutes from "./routes/headlinesRoutes.js";
import verifyJWT from "./middlewares/veridyJWT.js";
import cors from "cors";
import http from "http";

dotenv.config();

import { Server } from "socket.io";
const app = express();

const server = http.createServer(app);

// middleware

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// allow origin for all
app.use(cors());

app.use("/images", express.static("images"));

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} A user connected`);
  socket.on("message", (data) => {
    console.log(data);
    io.emit("messageResponse", data);
  });
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

//

app.use("/users", userRoute);

app.use(verifyJWT);

app.use("/projects", projectRoute);
app.use("/task", taskRoute);
app.use("/attachments", attachmentRoute);
app.use("", chatRoutes);
app.use("/jobs", jobsRoute);
app.use("/quote", quoteRoute);
app.use("/joke", jokeRoute);
app.use("/headlines", headlinesRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => {
    console.log("App connected to database");
    server.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
