function socketAppel(io, socket) {
  // Quand un utilisateur envoie une "offre"
  socket.on('offer', (data) => {
    console.log("Offre reçue");
    socket.broadcast.emit('offer', data); // envoyer à tous les autres sauf lui-même
  });

  // Quand un utilisateur envoie une "réponse"
  socket.on('answer', (data) => {
    console.log("Réponse reçue");
    socket.broadcast.emit('answer', data);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion :', socket.id);
    console.log(`🔴 ${socket.id} s’est déconnecté`);
  });
}

module.exports = { socketAppel };
