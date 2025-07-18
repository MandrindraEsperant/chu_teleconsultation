const meetingService = require("../services/meetingService")
const { validationResult } = require("express-validator")
const { successResponse, errorResponse } = require("../utils/jsonResponse")

class MeetingController {
  // POST /api/meetings
  async createMeeting(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return errorResponse(res, "Données invalides", 400, { errors: errors.array() })
      }

      const { title, description, scheduledDate, reminder } = req.body
      const hostId = req.user.id

      const meeting = await meetingService.createMeeting(hostId, {
        title,
        description,
        scheduledDate,
        reminder,
      })

      return successResponse(res, "Réunion créée avec succès", 201, meeting)
    } catch (error) {
      console.error("Erreur création réunion:", error)
      return errorResponse(res, "Erreur lors de la création de la réunion", 500)
    }
  }

  // GET /api/meetings
  async getMeetingsByHost(req, res) {
    try {
      const hostId = req.user.id
      if (!req.user?.id) {
        return errorResponse(res, 'Non autorisé', 401);
      }
      const meetings = await meetingService.getMeetingsByHost(hostId)
      return successResponse(res, "Réunions récupérées avec succès", 200, meetings)
    } catch (error) {
      console.error("Erreur récupération réunions:", error)
      return errorResponse(res, "Erreur lors de la récupération des réunions", 500)
    }
  }

  // GET /api/meetings/:id
  async getMeetingById(req, res) {
    try {
      const { id } = req.params
      const meeting = await meetingService.getMeetingById(id)

      if (!meeting) {
        return errorResponse(res, "Réunion non trouvée", 404)
      }

      return successResponse(res, "Réunion récupérée avec succès", 200, meeting)
    } catch (error) {
      console.error("Erreur récupération réunion:", error)
      return errorResponse(res, "Erreur lors de la récupération de la réunion", 500)
    }
  }

  // GET /api/join/:code - Récupérer les infos d'une réunion pour la rejoindre
  async getMeetingInfoForJoin(req, res) {
    try {
      const { code } = req.params

      const result = await meetingService.canJoinMeeting(code)

      if (!result.canJoin) {
        return errorResponse(res, result.reason, 400, result.meeting || null)
      }

      // Retourner seulement les infos nécessaires (pas d'infos sensibles)
      const meetingInfo = {
        id: result.meeting.id,
        title: result.meeting.title,
        description: result.meeting.description,
        scheduledDate: result.meeting.scheduledDate,
        status: result.meeting.status,
        host: {
          name: `${result.meeting.host.firstName} ${result.meeting.host.lastName}`,
          profession: result.meeting.host.profession,
        },
      }

      return successResponse(res, "Réunion trouvée", 200, meetingInfo)
    } catch (error) {
      console.error("Erreur récupération réunion par code:", error)
      return errorResponse(res, "Erreur lors de la récupération de la réunion", 500, error)
    }
  }

  // PUT /api/meetings/:id
  async updateMeeting(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return errorResponse(res, "Données invalides", 400, { errors: errors.array() })
      }

      const { id } = req.params
      const { title, description, scheduledDate, reminder } = req.body

      // Vérifier que l'utilisateur est le propriétaire
      const existingMeeting = await meetingService.getMeetingById(id)
      if (!existingMeeting || existingMeeting.hostId !== req.user.id) {
        return errorResponse(res, "Non autorisé à modifier cette réunion", 403)
      }

      const meeting = await meetingService.updateMeeting(id, {
        title,
        description,
        scheduledDate,
        reminder,
      })

      return successResponse(res, "Réunion modifiée avec succès", 200, meeting)
    } catch (error) {
      console.error("Erreur modification réunion:", error)
      return errorResponse(res, "Erreur lors de la modification de la réunion", 500)
    }
  }

  // DELETE /api/meetings/:id
  async deleteMeeting(req, res) {
    try {
      const { id } = req.params

      // Vérifier que l'utilisateur est le propriétaire
      const existingMeeting = await meetingService.getMeetingById(id)
      if (!existingMeeting || existingMeeting.hostId !== req.user.id) {
        return errorResponse(res, "Non autorisé à supprimer cette réunion", 403)
      }

      await meetingService.deleteMeeting(id)

      return successResponse(res, "Réunion supprimée avec succès", 200)
    } catch (error) {
      console.error("Erreur suppression réunion:", error)
      return errorResponse(res, "Erreur lors de la suppression de la réunion", 500)
    }
  }

  // PUT /api/meetings/:id/status - Changer le statut d'une réunion
  async updateMeetingStatus(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return errorResponse(res, "Données invalides", 400, { errors: errors.array() })
      }

      const { id } = req.params
      const { status } = req.body

      const validStatuses = ["SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"]
      if (!validStatuses.includes(status)) {
        return errorResponse(res, "Statut invalide", 400)
      }

      // Vérifier que l'utilisateur est le propriétaire
      const existingMeeting = await meetingService.getMeetingById(id)
      if (!existingMeeting || existingMeeting.hostId !== req.user.id) {
        return errorResponse(res, "Non autorisé à modifier cette réunion", 403)
      }

      const meeting = await meetingService.updateMeetingStatus(id, status)

      return successResponse(res, "Statut mis à jour avec succès", 200, meeting)
    } catch (error) {
      console.error("Erreur mise à jour statut:", error)
      return errorResponse(res, "Erreur lors de la mise à jour du statut", 500)
    }
  }
}

module.exports = new MeetingController()
