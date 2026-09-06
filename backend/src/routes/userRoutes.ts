import { FastifyInstance } from 'fastify';
import { getProfile, updateProfile, updatePassword } from '../controllers/userController';

export default async function userRoutes(fastify: FastifyInstance) {
  // @ts-ignore
  fastify.get('/me', { preValidation: [fastify.authenticate] }, getProfile);
  // @ts-ignore
  fastify.put('/profile', { preValidation: [fastify.authenticate] }, updateProfile);
  // @ts-ignore
  fastify.put('/password', { preValidation: [fastify.authenticate] }, updatePassword);
}
