const { verifyToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/jsonResponse');
const prisma = new PrismaClient();


exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return errorResponse(res,401,'Non autorisé')

    const decoded = verifyToken(token);
    const session = await prisma.session.findUnique({ where: { id: decoded.sessionId } });

    if (!session || !session.isValid) return errorResponse(res,403,'Session invalide');

    req.user = { id: decoded.userId, role: decoded.role, sessionId: session.id };
    next();
  } catch (err) {
    errorResponse(res,401,'Token invalide ou expiré');
  }
};
