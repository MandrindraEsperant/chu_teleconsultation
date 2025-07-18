const { PrismaClient } = require('@prisma/client');
const { generateUniqueCode } = require('../utils/meetingHelpers');
require('dotenv').config();

const prisma = new PrismaClient();

class MeetingService {
  // Créer une réunion
  async createMeeting(hostId, data) {
    const uniqueCode = generateUniqueCode();
    const meetingLink = `${process.env.FRONTEND_URL}/join/${uniqueCode}`;

    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        scheduledDate: new Date(data.scheduledDate),
        reminder: data.reminder,
        uniqueCode,
        meetingLink,
        hostId,
      }
    });
 
    return meeting;
  }

  // Récupérer les réunions d'un utilisateur
  async getMeetingsByHost(hostId) {
    if (!hostId) {
    throw new Error("hostId est requis mais est undefined.");
  }
    const meetings = await prisma.meeting.findMany({
      where: {
        hostId: hostId,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    return meetings;
  }

  // Récupérer une réunion par ID
  async getMeetingById(meetingId) {

    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return meeting;
  }

  // Récupérer une réunion par code unique (pour rejoindre)
  async getMeetingByCode(uniqueCode) {
    const meeting = await prisma.meeting.findUnique({
      where: {
        uniqueCode: uniqueCode,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return meeting;
  }

  // Modifier une réunion
  async updateMeeting(meetingId, data) {
    const meeting = await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.reminder !== undefined && { reminder: data.reminder }),
        updatedAt: new Date(),
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profession: true,
          }
        }
      }
    });

    return meeting;
  }

  // Supprimer une réunion
  async deleteMeeting(meetingId) {
    await prisma.meeting.delete({
      where: {
        id: meetingId,
      }
    });

    return true;
  }

  // Changer le statut d'une réunion
  async updateMeetingStatus(meetingId, status) {
    const meeting = await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      }
    });

    return meeting;
  }

  // Vérifier si une réunion peut être rejointe
  async canJoinMeeting(uniqueCode) {
    const meeting = await this.getMeetingByCode(uniqueCode);
    
    if (!meeting) {
      return { canJoin: false, reason: 'Réunion non trouvée' };
    }

    if (meeting.status === 'CANCELLED') {
      return { canJoin: false, reason: 'Réunion annulée' };
    }

    if (meeting.status === 'COMPLETED') {
      return { canJoin: false, reason: 'Réunion terminée' };
    }

    const now = new Date();
    const meetingTime = new Date(meeting.scheduledDate);
    const canJoinTime = new Date(meetingTime.getTime() - 15 * 60 * 1000); // 15 minutes avant

    if (now < canJoinTime) {
      return { 
        canJoin: false, 
        reason: 'La réunion ne peut être rejointe que 15 minutes avant le début',
        meeting 
      };
    }

    return { canJoin: true, meeting };
  }
}

module.exports = new MeetingService();