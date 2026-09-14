import { FastifyReply } from 'fastify';
import { prisma } from '../config/db';
import axios from 'axios';

const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'http://localhost:4001';

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
    const resolvedUserAgent = userAgent || request.headers['user-agent'];
    const tempId = require('crypto').randomBytes(12).toString('hex');

    // Create placeholder connection in DB
    // @ts-ignore
    await prisma.whatsAppConnection.upsert({
      where: { id: tempId },
      update: { status: 'connecting', name },
      create: {
        id: tempId,
        userId: request.user.userId,
        name,
        status: 'connecting',
        number: 'Loading...'
      }
    });

    // Fire and forget to microservice
    axios.post(`${MICROSERVICE_URL}/api/whatsapp/init`, {
      connectionId: tempId,
      userAgent: resolvedUserAgent
    }).catch(err => console.error(`[Microservice Error] Init failed:`, err.message));

    return { id: tempId };
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to create connection' });
  }
}

export async function pollQr(request: any, reply: FastifyReply) {
  try {
    const { id } = request.params;
    
    try {
      const msRes = await axios.get(`${MICROSERVICE_URL}/api/whatsapp/qr/${id}`);
      const data = msRes.data;

      // Update DB if connected
      if (data.status === 'connected' && data.info) {
        // @ts-ignore
        await prisma.whatsAppConnection.updateMany({
          where: { id },
          data: { 
            status: 'connected',
            number: data.info.number,
            name: data.info.name
          }
        });
      } else if (data.status === 'failed' || data.status === 'disconnected') {
        // @ts-ignore
        await prisma.whatsAppConnection.updateMany({
          where: { id },
          data: { status: 'disconnected' }
        });
      }

      return { status: data.status, qr: data.qr || null };
    } catch (msErr: any) {
      if (msErr.response?.status === 404) {
        // @ts-ignore
        const dbConn = await prisma.whatsAppConnection.findUnique({ where: { id } });
        if (dbConn && dbConn.status === 'connected') {
            return { status: 'connected', qr: null };
        }
        return reply.status(500).send({ error: 'Failed to start WhatsApp client on microservice.' });
      }
      throw msErr;
    }
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch QR from microservice' });
  }
}

export async function disconnectConnection(request: any, reply: FastifyReply) {
  try {
    const { id } = request.params;
    
    await axios.post(`${MICROSERVICE_URL}/api/whatsapp/disconnect/${id}`).catch(() => {});
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
    const { name, connectionId, contactIds, description, dp } = request.body;
    
    if (!name || !connectionId || !contactIds || !Array.isArray(contactIds)) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    const contacts = await prisma.contact.findMany({
      where: { 
        id: { in: contactIds },
        userId: request.user.userId,
        isWhatsAppRegistered: true 
      }
    });

    if (contacts.length === 0) {
      return reply.status(400).send({ error: 'No valid WhatsApp registered contacts found' });
    }

    const participants = contacts.map(c => `${c.phone.replace(/[^0-9]/g, '')}@c.us`);

    const job = await prisma.groupJob.create({
      data: {
        userId: request.user.userId,
        connectionId,
        name,
        totalContacts: participants.length,
        status: 'processing'
      }
    });

    try {
      await axios.post(`${MICROSERVICE_URL}/api/whatsapp/group`, {
        connectionId,
        name,
        participants,
        description,
        dp
      });
      
      await prisma.groupJob.update({
        where: { id: job.id },
        data: { status: 'completed', processedCount: participants.length }
      });
      return reply.send({ message: 'Group created successfully', jobId: job.id });
    } catch (err) {
      await prisma.groupJob.update({
        where: { id: job.id },
        data: { status: 'failed' }
      });
      return reply.status(500).send({ error: 'Failed to create group on microservice' });
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

    const res = await axios.post(`${MICROSERVICE_URL}/api/whatsapp/validate`, { connectionId, numbers });
    return reply.send({ results: res.data.results });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to validate numbers on microservice' });
  }
}

export async function handleHeartbeat(request: any, reply: FastifyReply) {
  return reply.send({ success: true });
}

export async function getGroups(request: any, reply: FastifyReply) {
  try {
    // @ts-ignore
    const connections = await prisma.whatsAppConnection.findMany({
      where: { userId: request.user.userId, status: 'connected' }
    });

    const allGroups = [];
    for (const conn of connections) {
      try {
        const res = await axios.get(`${MICROSERVICE_URL}/api/whatsapp/groups/${conn.id}`);
        for (const g of res.data.groups || []) {
          allGroups.push({
            ...g,
            status: 'active',
            lastSync: new Date().toLocaleTimeString(),
            connectionName: conn.name,
            connectionId: conn.id
          });
        }
      } catch (e) {
        console.error(`Failed to fetch groups for ${conn.id} from microservice`);
      }
    }
    return reply.send({ groups: allGroups });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch groups' });
  }
}

export async function requestPairingCode(request: any, reply: FastifyReply) {
  try {
    const { connectionId, phoneNumber } = request.body;
    if (!connectionId || !phoneNumber) {
      return reply.status(400).send({ error: 'Missing connectionId or phoneNumber' });
    }

    const res = await axios.post(`${MICROSERVICE_URL}/api/whatsapp/pairing-code`, { connectionId, phoneNumber });
    return reply.send(res.data);
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Failed to request pairing code from microservice' });
  }
}
