import { FastifyInstance } from 'fastify';
import { getConnections, createConnection, pollQr, disconnectConnection, createGroup, validateNumbers, handleHeartbeat, getGroups, requestPairingCode } from '../controllers/whatsappController';

export default async function whatsappRoutes(fastify: FastifyInstance) {
  // @ts-ignore
  fastify.get('/connections', { preValidation: [fastify.authenticate] }, getConnections);
  // @ts-ignore
  fastify.post('/connect', { preValidation: [fastify.authenticate] }, createConnection);
  // @ts-ignore
  fastify.post('/pairing-code', { preValidation: [fastify.authenticate] }, requestPairingCode);
  // @ts-ignore
  fastify.get('/qr/:id', { preValidation: [fastify.authenticate] }, pollQr);
  // @ts-ignore
  fastify.delete('/disconnect/:id', { preValidation: [fastify.authenticate] }, disconnectConnection);
  // @ts-ignore
  fastify.post('/group', { preValidation: [fastify.authenticate] }, createGroup);
  // @ts-ignore
  fastify.get('/groups', { preValidation: [fastify.authenticate] }, getGroups);
  // @ts-ignore
  fastify.post('/validate-numbers', { preValidation: [fastify.authenticate] }, validateNumbers);
  // @ts-ignore
  fastify.post('/heartbeat', { preValidation: [fastify.authenticate] }, handleHeartbeat);
}
