const express = require('express');
const cors= require('cors')
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: "http://localhost:3000", // ton frontend
  credentials: true                // si tu utilises des cookies ou sessions
}))

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send('API Secure Auth OK'));

module.exports = app;
