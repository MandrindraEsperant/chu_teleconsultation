function socketHandler(io, socket) {
  // Quand un client rejoint une room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 ${socket.id} a rejoint la room ${roomId}`);

    // Informer les autres dans la room qu’un nouvel utilisateur est arrivé
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Signaling: on relaie les messages entre les utilisateurs
  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", {
      from: socket.id,
      offer: data.offer,
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", {
      from: socket.id,
      answer: data.answer,
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  // Quand un utilisateur se déconnecte
  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} s’est déconnecté`);
    io.emit("user-disconnected", socket.id);
  });
}

module.exports = { socketHandler };
