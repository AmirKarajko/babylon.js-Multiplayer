// Imports the Express framework
const express = require("express");
// Imports the HTTP module to create a server
const http = require("http");
// Imports the Server class from Socket.IO to handle WebSocket connections
const { Server } = require("socket.io");

// Initializes an Express application
const app = express();
// Creates an HTTP server using the Express app
const server = http.createServer(app);
// Initializes a Socket.IO server with the created HTTP server
const io = new Server(server);

// Players
const players = {};

// Static files
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New player joined:", socket.id);

  // Players
  players[socket.id] = { x: 0, y: 0, z: 0 }; 

  // Emit all players position
  socket.emit("emitAllPlayersPosition", players);

  // On new player join
  socket.broadcast.emit("playerConnected", { id: socket.id, ...players[socket.id] });

  // Update players position
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

// Defines the port number for the server
const PORT = 3000;
// Starts the server and listens on the specified port
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
