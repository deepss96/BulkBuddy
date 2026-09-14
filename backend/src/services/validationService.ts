import { prisma } from '../config/db';
import axios from 'axios';

const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'http://localhost:4001';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let isRunning = false;

export const startValidationLoop = async () => {
  if (isRunning) return;
  isRunning = true;

  console.log('[Validation Service] Started');

  while (true) {
    try {
      const connections = await prisma.whatsAppConnection.findMany({ where: { status: 'connected' } });
      
      if (connections.length === 0) {
        await sleep(10000);
        continue;
      }

      const connectionId = connections[0].id;

      const pendingContacts = await prisma.contact.findMany({
        where: { isWhatsAppRegistered: null },
        take: 10,
        orderBy: { createdAt: 'asc' }
      });

      if (pendingContacts.length === 0) {
        await sleep(5000);
        continue;
      }

      console.log(`[Validation Service] Validating ${pendingContacts.length} contacts...`);

      const numbers = pendingContacts.map(c => c.phone);
      
      try {
        const res = await axios.post(`${MICROSERVICE_URL}/api/whatsapp/validate`, { connectionId, numbers });
        const results = res.data.results || [];

        for (const contact of pendingContacts) {
          const resObj = results.find((r: any) => r.phone === contact.phone);
          const isRegistered = resObj ? resObj.isWhatsAppRegistered : false;

          await prisma.contact.update({
            where: { id: contact.id },
            data: { isWhatsAppRegistered: isRegistered }
          });
        }
      } catch (err) {
        console.error(`[Validation Service] Microservice validation error:`, err);
        await sleep(5000);
      }
      
      await sleep(1000);
    } catch (err) {
      console.error('[Validation Service] Loop error:', err);
      await sleep(10000);
    }
  }
};
