import { FastifyReply } from 'fastify';
import { prisma } from '../config/db';
import { initializeWhatsAppClient, disconnectWhatsAppClient, qrCodes } from '../services/whatsappService';

export async function getConnections(request: any, reply: FastifyReply) {
  try {
    // @ts-ignore
    const connections = await prisma.whatsAppConnection.findMany({
      where: { userId: request.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    return connections;
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch connections' });
  }
}

export async function createConnection(request: any, reply: FastifyReply) {
  try {
    const { name, userAgent } = request.body || { name: 'New Phone' };
    
    // Use the userAgent sent by the frontend (the real browser UA of the user's device)
    // Fallback to the HTTP request's own user-agent header if not provided
    const resolvedUserAgent = userAgent || request.headers['user-agent'];

    // Generate a temporary ID for tracking the in-progress connection (Must be valid 24-char hex for MongoDB ObjectID)
    const tempId = require('crypto').randomBytes(12).toString('hex');

    // Start whatsapp client in background with the real user agent
    initializeWhatsAppClient(tempId, request.user.userId, name, resolvedUserAgent).catch(console.error);

    return { id: tempId };
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to create connection' });
  }
}

export async function pollQr(request: any, reply: FastifyReply) {
  try {
    const { id } = request.params;
    
    // Check db status
    // @ts-ignore
    const connection = await prisma.whatsAppConnection.findUnique({ where: { id } });
    if (connection) {
      if (connection.status === 'connected') {
        return { status: 'connected' };
      }
    }

    const { clients } = require('../services/whatsappService');
    const isClientAlive = !!clients[id];

    const rawQr = qrCodes[id];
    if (rawQr) {
      return { status: 'connecting', qr: rawQr };
    } else if (!isClientAlive) {
      // The client was deleted (probably failed to start Chrome)
      return reply.status(500).send({ error: 'Failed to start WhatsApp client. This usually means the server is missing Chrome/Puppeteer dependencies.' });
    } else {
      return { status: 'connecting', qr: null };
    }
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch QR' });
  }
}

export async function requestPairingCode(request: any, reply: FastifyReply) {
  try {
    const { connectionId, phoneNumber } = request.body;
    if (!connectionId || !phoneNumber) {
      return reply.status(400).send({ error: 'Missing connectionId or phoneNumber' });
    }

    const { clients } = require('../services/whatsappService');
    const client = clients[connectionId];

    if (!client) {
      return reply.status(400).send({ error: 'WhatsApp client is not active. Please reconnect.' });
    }

    // Clean phone number: remove all non-numeric characters
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');

    // Request the pairing code
    const code = await client.requestPairingCode(cleanPhone);
    return reply.send({ code });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to request pairing code' });
  }
}

export async function disconnectConnection(request: any, reply: FastifyReply) {
  try {
    const { id } = request.params;
    
    await disconnectWhatsAppClient(id);

    // @ts-ignore
    await prisma.whatsAppConnection.deleteMany({ where: { id, userId: request.user.userId } });
    return { success: true };
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to disconnect' });
  }
}

export async function createGroup(request: any, reply: FastifyReply) {
  try {
    const { name, connectionId, contactIds } = request.body;
    
    if (!name || !connectionId || !contactIds || !Array.isArray(contactIds)) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    if (contactIds.length > 1024) {
      return reply.status(400).send({ error: 'Cannot add more than 1024 members to a group' });
    }

    // Get the client
    const { clients } = require('../services/whatsappService');
    const client = clients[connectionId];

    if (!client) {
      return reply.status(400).send({ error: 'WhatsApp client is not connected' });
    }

    // Fetch the actual phone numbers for these contacts
    const contacts = await prisma.contact.findMany({
      where: { 
        id: { in: contactIds },
        userId: request.user.userId,
        isWhatsAppRegistered: true // only valid contacts
      }
    });

    if (contacts.length === 0) {
      return reply.status(400).send({ error: 'No valid WhatsApp registered contacts found in the selection' });
    }

    // Format phones to WhatsApp ID format
    const participants = contacts.map(c => `${c.phone.replace(/[^0-9]/g, '')}@c.us`);

    // Record the job in the database
    const job = await prisma.groupJob.create({
      data: {
        userId: request.user.userId,
        connectionId,
        name,
        totalContacts: participants.length,
        status: 'processing'
      }
    });

    const { description, dp } = request.body;
    const { MessageMedia } = require('whatsapp-web.js');

    // Create group via whatsapp-web.js (BLOCKING)
    try {
      const result = await client.createGroup(name, participants);
      console.log(`[Group Creation] Successfully created group: ${name}`);
      
      let chat = null;
      if (result.gid) {
        // Retry fetching chat up to 5 times (15 seconds total)
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          try {
            chat = await client.getChatById(result.gid._serialized);
            if (chat) break;
          } catch (err) {
            console.log(`[Group Creation] Chat not ready yet, retrying... (${i + 1}/5)`);
          }
        }
        
        if (chat) {
          if (description) {
            await chat.setDescription(description).catch((err: any) => console.error('Failed to set description:', err));
          }
          
          if (dp && typeof dp === 'string') {
            const matches = dp.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const mimetype = matches[1];
              const b64data = matches[2];
              const media = new MessageMedia(mimetype, b64data, 'dp.jpg');
              await chat.setPicture(media).catch((err: any) => console.error('Failed to set DP:', err));
            }
          }
        } else {
          console.error('[Group Creation] Could not fetch chat to set DP and Description after retries.');
        }
      }

      await prisma.groupJob.update({
        where: { id: job.id },
        data: { status: 'completed', processedCount: participants.length }
      });

      return reply.send({ 
         message: 'Group created successfully', 
         jobId: job.id, 
         expectedMembers: participants.length,
         groupData: { name, description, dp }
      });

    } catch (err: any) {
      console.error(`[Group Creation] Error creating group:`, err);
      await prisma.groupJob.update({
        where: { id: job.id },
        data: { status: 'failed' }
      });
      return reply.status(500).send({ error: 'Failed to create group' });
    }
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to create group' });
  }
}

export async function validateNumbers(request: any, reply: FastifyReply) {
  try {
    const { connectionId, numbers } = request.body;
    if (!connectionId || !numbers || !Array.isArray(numbers)) {
      return reply.status(400).send({ error: 'Missing connectionId or numbers array' });
    }

    const { clients } = require('../services/whatsappService');
    const client = clients[connectionId];
    if (!client) {
      return reply.status(400).send({ error: 'WhatsApp client is not connected' });
    }

    const results = [];
    for (const number of numbers) {
      try {
        // WhatsApp API requires numbers without the '+' sign
        const cleanPhone = number.replace(/[^\d]/g, '');
        const isRegistered = await client.isRegisteredUser(`${cleanPhone}@c.us`);
        results.push({ phone: number, isWhatsAppRegistered: isRegistered });
      } catch (err) {
        results.push({ phone: number, isWhatsAppRegistered: false });
      }
    }

    return reply.send({ results });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to validate numbers' });
  }
}

export async function handleHeartbeat(request: any, reply: FastifyReply) {
  try {
    const { clients, lastPing } = require('../services/whatsappService');
    // Get the user's active connections
    // @ts-ignore
    const connections = await prisma.whatsAppConnection.findMany({
      where: { userId: request.user.userId, status: 'connected' }
    });

    const now = Date.now();
    for (const conn of connections) {
      if (clients[conn.id]) {
        lastPing[conn.id] = now;
      }
    }

    return reply.send({ success: true });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to record heartbeat' });
  }
}

export async function getGroups(request: any, reply: FastifyReply) {
  try {
    const { clients } = require('../services/whatsappService');
    // @ts-ignore
    const connections = await prisma.whatsAppConnection.findMany({
      where: { userId: request.user.userId, status: 'connected' }
    });

    const allGroups = [];

    for (const conn of connections) {
      const client = clients[conn.id];
      // Only fetch if client is fully ready (client.info is populated on ready)
      if (client && client.info) {
        try {
          const chats = await client.getChats();
          const groups = chats.filter((c: any) => c.isGroup);
          
          for (const g of groups) {
            allGroups.push({
              id: g.id._serialized,
              name: g.name || 'Unknown Group',
              members: g.participants?.length || 0,
              provider_id: g.id._serialized,
              status: 'active',
              lastSync: new Date().toLocaleTimeString(),
              connectionName: conn.name,
              connectionId: conn.id
            });
          }
        } catch (err) {
          console.error(`Failed to fetch groups for ${conn.id} using getChats, attempting fallback...`);
          try {
            // Fallback for newer WhatsApp Web versions where getChats might throw due to WWebJS store changes
            const rawGroups = await client.pupPage.evaluate(() => {
               const w = window as any;
               const chats = w.Store ? (w.Store.Chat ? w.Store.Chat.getModelsArray() : []) : [];
               return chats.filter((c: any) => c.isGroup).map((c: any) => ({
                  id: c.id._serialized,
                  name: c.formattedTitle || c.name || 'Unknown Group',
                  members: c.participants ? c.participants.length : 0
               }));
            });
            
            for (const g of rawGroups) {
              allGroups.push({
                id: g.id,
                name: g.name,
                members: g.members,
                provider_id: g.id,
                status: 'active',
                lastSync: new Date().toLocaleTimeString(),
                connectionName: conn.name,
                connectionId: conn.id
              });
            }
          } catch (fallbackErr) {
             console.error(`Fallback failed for ${conn.id}:`, fallbackErr);
          }
        }
      }
    }

    return reply.send({ groups: allGroups });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch groups' });
  }
}
