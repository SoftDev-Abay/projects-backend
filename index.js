import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";
import taskRoute from "./routes/taskRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import attachmentRoute from "./routes/attachmentRoute.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
const app = express();

const server = http.createServer(app);

// middleware

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

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
app.use("/projects", projectRoute);
app.use("/task", taskRoute);
app.use("/attachments", attachmentRoute);
app.use("", chatRoutes);

mongoose
  .connect(mongoDBURL, {
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
