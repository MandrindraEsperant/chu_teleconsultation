import express from 'express';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';
import fs from 'fs';
import path from 'path';

// Récupère l'IP locale
function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  throw new Error("IP locale introuvable");
}
// 2. Générer certificat avec mkcert
const ip = getLocalIp();
const port = 4000;
const certFile = `${ip}.pem`;
const keyFile = `${ip}-key.pem`;

if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
  console.log(`📜 Génération des certificats avec mkcert...`);
  execSync(`mkcert ${ip}`, { stdio: 'inherit' });
} else {
  console.log(`📜 Certificats déjà existants.`);
}


// const certFile = `${ip}.pem`;
// const keyFile = `${ip}-key.pem`;

const app = express();
const cert = readFileSync(path.resolve(certFile));
const key = readFileSync(path.resolve(keyFile));

// Création du serveur HTTPS
const httpsServer = createServer({ key, cert }, app);
const io = new Server(httpsServer, {
  cors: {
    origin: "*", // ⚠️ à adapter pour la prod
    methods: ["GET", "POST"],
  },
});

// Stocker les offres par salle
const offersByRoom = new Map(); // Map<roomId, offerData>

// logique Socket.io ici
io.on('connection', (socket) => {
  console.log("✅ Utilisateur connecté", socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Utilisateur ${socket.id} a rejoint la salle ${roomId}`);
    const clients = io.sockets.adapter.rooms.get(roomId);
    console.log(`Salle ${roomId} a ${clients?.size} utilisateurs`);
    socket.to(roomId).emit('user-connected', socket.id);

    // Envoyer l’offre existante (si elle existe) au client qui rejoint
    if (offersByRoom.has(roomId)) {
      console.log(`📨 Envoi de l’offre stockée au nouvel utilisateur ${socket.id} dans la salle ${roomId}`);
      socket.emit('offer', offersByRoom.get(roomId));
    }

    socket.to(roomId).emit('user-connected', socket.id);
  });
  // ici, ta logique socket ...
  // Quand un utilisateur envoie une "offre"
  socket.on('offer', (data) => {
    console.log(`📨 Offre reçue de ${socket.id} pour la salle ${data.roomId}:`, data.offer);
    // Stocker l’offre pour la salle
    offersByRoom.set(data.roomId, data.offer);
    socket.to(data.roomId).emit('offer', data.offer);

    // console.log("Offre reçue");
    // socket.broadcast.emit('offer', data);// envoyer à tous les autres sauf lui-même
  });

  // Quand un utilisateur envoie une "réponse"
  socket.on('answer', (data) => {
    console.log(`📨 Réponse reçue de ${socket.id} pour la salle ${data.roomId}:`, data.answer);
    socket.to(data.roomId).emit('answer', data.answer);
    // Optionnel : nettoyer l’offre après réception de la réponse
    offersByRoom.delete(data.roomId);

    // console.log("Réponse reçue");
    // socket.broadcast.emit('answer', data);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion :', socket.id);
    console.log(`🔴 ${socket.id} s’est déconnecté`);
  });
});

httpsServer.listen(port, () => {
  console.log(`✅ Backend Socket.io HTTPS démarré sur https://${ip}:${port}`);
});
