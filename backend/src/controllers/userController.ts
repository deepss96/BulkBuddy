import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/db';
import * as bcrypt from 'bcryptjs';

export async function getProfile(request: any, reply: FastifyReply) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return user;
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}

export async function updateProfile(request: any, reply: FastifyReply) {
  const { name, email } = request.body;
  if (!name || !email) return reply.status(400).send({ error: 'Missing fields' });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: request.user.userId },
      data: { name, email },
      select: { id: true, name: true, email: true }
    });
    return updatedUser;
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}

export async function updatePassword(request: any, reply: FastifyReply) {
  const { currentPassword, newPassword } = request.body;
  if (!currentPassword || !newPassword) return reply.status(400).send({ error: 'Missing fields' });

  try {
    const user = await prisma.user.findUnique({ where: { id: request.user.userId } });
    if (!user || !user.passwordHash) return reply.status(400).send({ error: 'User does not have a password (SSO login)' });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return reply.status(401).send({ error: 'Invalid current password' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return { message: 'Password updated successfully' };
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}
