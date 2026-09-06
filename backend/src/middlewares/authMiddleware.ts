import { FastifyRequest, FastifyReply } from 'fastify';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET || 'super_secret_dev_key_replace_me_in_prod';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new Error('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    (request as any).user = decoded;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}
