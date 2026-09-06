import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET || 'super_secret_dev_key_replace_me_in_prod';

export async function signup(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = request.body as any;
  
  if (!name || !email || !password) {
    return reply.status(400).send({ error: 'Missing required fields' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as any;

  if (!email || !password) {
    return reply.status(400).send({ error: 'Missing required fields' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return reply.status(401).send({ error: 'Invalid credentials or login via Google.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}

export async function googleCallback(request: any, reply: FastifyReply) {
  try {
    let userInfo;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (googleClientId && googleClientSecret && googleClientId !== 'dummy_client_id' && googleClientSecret !== 'dummy_client_secret') {
      const { token } = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      // In a real app, use the access_token to fetch user info from Google
      userInfo = {
        id: 'google-real-12345',
        email: 'realgoogleuser@example.com',
        name: 'Real Google User'
      };
    } else {
      userInfo = {
        id: 'google-mock-12345',
        email: 'mockgoogleuser@example.com',
        name: 'Google Mock User'
      };
    }

    let user = await prisma.user.findUnique({ where: { email: userInfo.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: userInfo.id }
      });
    }

    const jwtToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    reply.redirect(`http://localhost:3000/?token=${jwtToken}`);
  } catch (error) {
    request.server.log.error(error);
    reply.redirect('http://localhost:3000/?error=oauth_failed');
  }
}
