import { FastifyInstance } from 'fastify';
import { signup, login, googleCallback } from '../controllers/authController';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/signup', signup);
  fastify.post('/login', login);
  
  // Mock Google auth route for development if OAuth2 is not fully configured
  fastify.get('/google', async (request, reply) => {
    reply.redirect('/api/v1/auth/google/callback?code=mock_dev_code');
  });

  fastify.get('/google/callback', googleCallback);
}
