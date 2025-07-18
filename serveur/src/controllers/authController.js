const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken, verifyToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/jsonResponse');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.app_user.findUnique({ where: { email } });
    if (existingUser)
      return errorResponse(res, 'Email déjà utilisé.', 409,);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.app_user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return successResponse(res, 'Utilisateur créé avec succès.', 201, {
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Erreur serveur lors de l’inscription.');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return errorResponse(res, 'Utilisateur introuvable.', 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Mot de passe incorrect.', 401);
    }

    // Créer une nouvelle session
    const userAgent = req.headers['user-agent'] || 'Inconnu';
    const ipAddress = req.ip || req.connection.remoteAddress;

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60); 
    // expire dans 60 jours:dans le base de donné

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    const token = generateToken({
      sessionId: session.id,
      userId: user.id,
      role: user.role,
    });

    // Envoyer le token dans un cookie sécurisé HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 60, // 60 jours : duré de cookies
    });

    return successResponse(res, 'Connexion réussie.', 200, {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Erreur serveur lors de la connexion.');
  }
};
exports.verify = async (req, res) => {

  try {
    // Extraire le token depuis le header Authorization ou le cookie
     const token =req.cookies.token;
    if (!token) {
      return errorResponse(res, 'Aucun token fourni.');
    }
    const decoded = verifyToken(token);

    // Vérifier si la session existe et est valide dans la base de données
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
    });
 
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session introuvable.',
      });
    }

    if (session.expiresAt < new Date()) {
      // Supprimer la session expirée
      await prisma.user_session.delete({ where: { id: decoded.sessionId } });
      return errorResponse(res, 'Session expirée.');
    }

    // Token et session valides
    return successResponse(res, 'Token valide.', 200, {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return errorResponse(res, 'Token invalide ou erreur serveur.', 401);
  }
};
exports.logout = async (req, res) => {
  try {
    // Supprimer le cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return successResponse(res, 'Déconnexion réussie.')
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Erreur serveur lors de la déconnexion.')
  }
};

