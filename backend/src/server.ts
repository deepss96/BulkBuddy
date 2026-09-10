import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import oauthPlugin from '@fastify/oauth2';
import multipart from '@fastify/multipart';
import { authMiddleware } from './middlewares/authMiddleware';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import contactRoutes from './routes/contactRoutes';
import { startValidationLoop } from './services/validationService';

const fastify = Fastify({ logger: { level: 'error' } });

fastify.register(cors, {
  origin: true, // Allow any origin dynamically
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

fastify.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to protect routes
fastify.decorate('authenticate', authMiddleware);

// Google SSO configuration - only register if credentials are provided
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret && googleClientId !== 'dummy_client_id' && googleClientSecret !== 'dummy_client_secret') {
  fastify.register(oauthPlugin, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: googleClientId,
        secret: googleClientSecret
      },
      // @ts-ignore
      auth: oauthPlugin.google
    },
    startRedirectPath: '/api/v1/auth/google',
    callbackUri: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`
  });
}

// Setup simple health check
fastify.get('/ping', async (request, reply) => {
  return { status: 'ok' };
});

// Register Routes
fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/user' });
fastify.register(whatsappRoutes, { prefix: '/api/v1/whatsapp' });
fastify.register(contactRoutes, { prefix: '/api/v1/contacts' });

import { restoreSessions } from './services/whatsappService';

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
    // Test database connection
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("Database connected successfully! 🚀");
    
    // Start background services
    startValidationLoop();
    await restoreSessions();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
