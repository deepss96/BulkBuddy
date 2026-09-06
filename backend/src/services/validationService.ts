import { prisma } from '../config/db';
import { clients } from './whatsappService';

// Sleep helper to avoid spamming WhatsApp API
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let isRunning = false;

export const startValidationLoop = async () => {
  if (isRunning) return;
  isRunning = true;

  console.log('[Validation Service] Started');

  while (true) {
    try {
      // Find any connected client
      const activeClientKeys = Object.keys(clients).filter(key => clients[key] && clients[key].info);
      
      if (activeClientKeys.length === 0) {
        // No active whatsapp clients, wait 10 seconds and try again
        await sleep(10000);
        continue;
      }

      // We'll use the first active client to validate numbers
      const client = clients[activeClientKeys[0]];

      // Find contacts that need validation (limit to 10 per batch to avoid rate limits)
      const pendingContacts = await prisma.contact.findMany({
        where: { isWhatsAppRegistered: null },
        take: 10,
        orderBy: { createdAt: 'asc' }
      });

      if (pendingContacts.length === 0) {
        // No pending contacts, wait 5 seconds
        await sleep(5000);
        continue;
      }

      console.log(`[Validation Service] Validating ${pendingContacts.length} contacts...`);

      for (const contact of pendingContacts) {
        try {
          // Format phone to whatsapp id format
          const formattedPhone = contact.phone.replace(/[^0-9]/g, '');
          const wid = `${formattedPhone}@c.us`;

          // Check if registered
          const isRegistered = await client.isRegisteredUser(wid);

          // Update contact
          await prisma.contact.update({
            where: { id: contact.id },
            data: { isWhatsAppRegistered: isRegistered }
          });

          // Small delay between checks (e.g. 1 second) to mimic human and avoid temp ban
          await sleep(1000);
        } catch (err) {
          console.error(`[Validation Service] Error validating contact ${contact.id}:`, err);
          // We can optionally mark it as false or leave it null to retry later.
          // For safety, let's wait 5 seconds if there's an error.
          await sleep(5000);
        }
      }
    } catch (err) {
      console.error('[Validation Service] Loop error:', err);
      await sleep(10000);
    }
  }
};
