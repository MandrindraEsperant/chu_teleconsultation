const { verifyToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/jsonResponse');
const prisma = new PrismaClient();


exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) return errorResponse(res,'Non autorisé',401)
    const decoded = verifyToken(token);
    const session = await prisma.session.findUnique({ where: { id: decoded.sessionId } });
    if (!session || !session.isValid) return errorResponse(res,'Session invalide',403);
    req.user = { id: decoded.userId, role: decoded.role, sessionId: session.id };
    next();
  } catch (err) {
    errorResponse(res,'Token invalide ou expiré',401);
  }
};
