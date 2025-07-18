// Générer un code unique pour la réunion
function generateUniqueCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Mapper les types de rappel
function mapReminderType(frontendType) {
  const mapping = {
    'at_time': 'AT_TIME',
    '5_minutes': 'FIVE_MINUTES',
    '10_minutes': 'TEN_MINUTES',
    '15_minutes': 'FIFTEEN_MINUTES',
    '30_minutes': 'THIRTY_MINUTES',
    '1_hour': 'ONE_HOUR',
    '2_hours': 'TWO_HOURS',
    '1_day': 'ONE_DAY',
    '2_days': 'TWO_DAYS',
  };
  
  return mapping[frontendType] || null;
}

// Calculer le temps de rappel
function calculateReminderTime(scheduledDate, reminderType) {
  const date = new Date(scheduledDate);
  
  switch (reminderType) {
    case 'AT_TIME':
      return date;
    case 'FIVE_MINUTES':
      return new Date(date.getTime() - 5 * 60 * 1000);
    case 'TEN_MINUTES':
      return new Date(date.getTime() - 10 * 60 * 1000);
    case 'FIFTEEN_MINUTES':
      return new Date(date.getTime() - 15 * 60 * 1000);
    case 'THIRTY_MINUTES':
      return new Date(date.getTime() - 30 * 60 * 1000);
    case 'ONE_HOUR':
      return new Date(date.getTime() - 60 * 60 * 1000);
    case 'TWO_HOURS':
      return new Date(date.getTime() - 2 * 60 * 60 * 1000);
    case 'ONE_DAY':
      return new Date(date.getTime() - 24 * 60 * 60 * 1000);
    case 'TWO_DAYS':
      return new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

module.exports = {
  generateUniqueCode,
  mapReminderType,
  calculateReminderTime,
};