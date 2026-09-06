import { FastifyInstance } from 'fastify';
import { prisma } from '../config/db';
import { getContacts, uploadCsv } from '../controllers/contactController';

export default async function (fastify: FastifyInstance) {
  // All routes are protected
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await (fastify as any).authenticate(request, reply);
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.get('/', getContacts);
  fastify.post('/', async (request: any, reply) => {
    try {
      const user = request.user;
      const { name, phone } = request.body as any;
      if (!phone) return reply.status(400).send({ error: 'Phone number is required' });
      
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const contact = await prisma.contact.upsert({
        where: { userId_phone: { userId: user.userId, phone: cleanPhone } },
        update: { name },
        create: { userId: user.userId, phone: cleanPhone, name, isWhatsAppRegistered: null }
      });
      return reply.send(contact);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to add contact' });
    }
  });
  fastify.post('/upload', uploadCsv);
  fastify.post('/bulk', async (request: any, reply) => {
    try {
      const user = request.user;
      const contacts = request.body as { name: string, phone: string, isWhatsAppRegistered: boolean | null }[];
      
      let imported = 0;
      for (const record of contacts) {
        if (!record.phone) continue;
        const cleanPhone = record.phone.replace(/[^\d+]/g, '');
        if (cleanPhone.length > 5) {
          await prisma.contact.upsert({
            where: { userId_phone: { userId: user.userId, phone: cleanPhone } },
            update: { 
              name: record.name || undefined,
              isWhatsAppRegistered: record.isWhatsAppRegistered
            },
            create: { 
              userId: user.userId, 
              phone: cleanPhone, 
              name: record.name || '', 
              isWhatsAppRegistered: record.isWhatsAppRegistered 
            }
          });
          imported++;
        }
      }
      return reply.send({ message: `Successfully imported ${imported} contacts`, imported });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to save bulk contacts' });
    }
  });
}
