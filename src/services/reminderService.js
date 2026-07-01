export function generateReminderMessage(clientName, deadlineType, dueDate, firmName) {
  return `Namaste ${clientName},\n\nAapki ${deadlineType} ki due date ${dueDate} hai.\n\nKripya apne documents samay par share karein.\n\nDhanyavaad.\n— ${firmName}`;
}

export async function sendWhatsAppSilent(phoneNumber, message) {
  // Simulate sending via WhatsApp API in the background
  console.log(`Simulating background send to ${phoneNumber}:`, message);
  return new Promise(resolve => setTimeout(resolve, 1000));
}
