import { FastifyRequest, FastifyReply } from 'fastify';
import { parse } from 'csv-parse/sync';
import { prisma } from '../config/db';

export const getContacts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const contacts = await prisma.contact.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send(contacts);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
};

export const uploadCsv = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const fileContent = buffer.toString('utf-8');

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });

    let imported = 0;
    
    // Process records in batches for performance
    for (const record of records as any[]) {
      // Find the phone column
      let phone = record['phone'] || record['Phone'] || record['Number'] || record['number'] || record['Phone Number'] || record['whatsapp'] || record['WhatsApp'];
      let name = record['name'] || record['Name'] || record['Contact Name'] || record['contact'] || '';

      if (phone) {
        // Clean phone number (remove non-digits, add plus if needed, etc)
        phone = phone.replace(/[^\d+]/g, '');
        if (phone.length > 5) {
          // Check if already exists to avoid throwing unique constraint error
          // Upsert contact
          await prisma.contact.upsert({
            where: {
              userId_phone: {
                userId: user.id,
                phone: phone
              }
            },
            update: {
              name: name || undefined // Update name if provided
            },
            create: {
              userId: user.id,
              phone: phone,
              name: name,
              isWhatsAppRegistered: null // Pending validation
            }
          });
          imported++;
        }
      }
    }

    return reply.send({ message: `Successfully imported ${imported} contacts`, imported });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to process CSV file' });
  }
};
