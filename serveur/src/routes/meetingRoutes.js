const express = require('express');
const { body } = require('express-validator');
const meetingController = require('../controllers/meetingController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation pour la création/modification de réunion
const meetingValidation = [
  body('title')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ max: 255 })
    .withMessage('Le titre ne peut pas dépasser 255 caractères'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  
  body('scheduledDate')
    .isISO8601()
    .withMessage('Format de date invalide')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date doit être dans le futur');
      }
      return true;
    }),
  
  body('reminder')
    .optional()
    .isIn([
      'NONE','AT_TIME', 'FIVE_MINUTES', 'TEN_MINUTES', 'FIFTEEN_MINUTES',
      'THIRTY_MINUTES', 'ONE_HOUR', 'TWO_HOURS', 'ONE_DAY', 'TWO_DAYS'
    ])
    .withMessage('Type de rappel invalide'),
];

// Route publique pour rejoindre une réunion (pas d'auth requise)
// GET /api/join/:code - Récupérer les infos d'une réunion pour la rejoindre
router.get('/join/:code', meetingController.getMeetingInfoForJoin);

// Routes protégées (nécessitent une authentification)
router.use(requireAuth);

// POST /api/meetings - Créer une réunion
router.post('/', meetingValidation, meetingController.createMeeting);

// GET /api/meetings - Récupérer les réunions de l'utilisateur
router.get('/', meetingController.getMeetingsByHost);

// GET /api/meetings/:id - Récupérer une réunion par ID
router.get('/:id', meetingController.getMeetingById);

// PUT /api/meetings/:id - Modifier une réunion
router.put('/:id', meetingValidation, meetingController.updateMeeting);

// DELETE /api/meetings/:id - Supprimer une réunion
router.delete('/:id', meetingController.deleteMeeting);

// PUT /api/meetings/:id/status - Changer le statut d'une réunion
router.put('/:id/status', [
  body('status').isIn(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
], meetingController.updateMeetingStatus);

module.exports = router;