const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const players = {};

// Static files
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New player joined:", socket.id);

  players[socket.id] = { x: 0, y: 0, z: 0 }; 

  socket.emit("emitAllPlayerPositions", players);

  socket.broadcast.emit("playerConnected", { id: socket.id, ...players[socket.id] });

  socket.on("playerPosition", (data) => {
    players[socket.id] = { ...data };
    socket.broadcast.emit("updatePlayerPosition", { id: socket.id, ...data });
  });

  // Remove player when disconnected
  socket.on("disconnect", () => {
    console.log("Player left the game:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("playerLeft", socket.id); 
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
