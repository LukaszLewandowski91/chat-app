const express = require("express");
const path = require("path");
const socket = require("socket.io");

const app = express();
const messages = [];
const users = [];

app.use(express.static(path.join(__dirname, "/client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/index.html"));
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port: 8000");
});

const io = socket(server);
io.on("connection", (socket) => {
  socket.on("join", (login) => {
    users.push({ name: login, id: socket.id });
    console.log(`Add new user ${login} with id: ${socket.id}`);
    socket.broadcast.emit("message", {
      author: "Chat Bot",
      content: `${login} has joined the conversation!`,
    });
  });
  socket.on("message", (message) => {
    console.log("Oh, I've got something from " + socket.id);
    messages.push(message);
    socket.broadcast.emit("message", message);
  });
  socket.on("disconnect", () => {
    const loginUser = users.find((user) => user.id === socket.id);

    if (loginUser) {
      const index = users.indexOf(loginUser);
      users.splice(index, 1);
      console.log(`Oh, ${loginUser.name} socket  ${socket.id}  has left`);
      socket.broadcast.emit("message", {
        author: "Chat Bot",
        content: `${loginUser.name} has left the conversation... :(`,
      });
    }
  });
});
