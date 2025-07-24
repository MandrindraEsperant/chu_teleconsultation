const http = require("http");
const { Server } = require("socket.io");
const app = require('./app');
const PORT = process.env.PORT || 4000;
const { socketHandler } = require("./controllers/socket.controller");
const { socketAppel } = require("./controllers/appelController");


// Création du serveur HTTP
const server = http.createServer(app);

// Configuration de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ à adapter pour la prod
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Nouvelle connexion socket:", socket.id);
 // socketHandler(io, socket); // on délègue à notre contrôleur
  socketAppel(io,socket);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});