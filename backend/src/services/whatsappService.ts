import { Client, LocalAuth } from 'whatsapp-web.js';
import { prisma } from '../config/db';

// In-memory store for active whatsapp clients and their QR codes
export const clients: Record<string, Client> = {};
export const qrCodes: Record<string, string> = {}; // connectionId -> qr base64 or raw string
export const lastPing: Record<string, number> = {}; // connectionId -> timestamp

// Lifecycle Monitor Interval (Runs every 1 minute)
setInterval(async () => {
  const now = Date.now();

  // 1. Check for Window Closed (no heartbeat for 2 mins)
  for (const connectionId of Object.keys(clients)) {
    // Only enforce heartbeat disconnect if a heartbeat was EVER received,
    // or if the client has been alive for more than 2 minutes without ANY heartbeat.
    // We will initialize lastPing to Date.now() when the client is created.
    const ping = lastPing[connectionId];
    if (ping && now - ping > 2 * 60 * 1000) {
      console.log(`[WhatsApp ${connectionId}] No heartbeat received for 2 mins. Disconnecting for safety...`);
      await disconnectWhatsAppClient(connectionId);
      delete lastPing[connectionId];
    }
  }

  // 2. Check for 1-week expiry
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // @ts-ignore
    const expiredConnections = await prisma.whatsAppConnection.findMany({
      where: {
        createdAt: {
          lt: oneWeekAgo
        }
      }
    });

    for (const conn of expiredConnections) {
      console.log(`[WhatsApp ${conn.id}] Session older than 1 week. Expiring and deleting...`);
      if (clients[conn.id]) {
        await disconnectWhatsAppClient(conn.id);
      }
      // @ts-ignore
      await prisma.whatsAppConnection.delete({ where: { id: conn.id } });
    }
  } catch (err) {
    console.error('[WhatsApp Monitor] Error checking expired sessions:', err);
  }
}, 60 * 1000);

export async function initializeWhatsAppClient(connectionId: string, userId: string, name: string) {
  if (clients[connectionId]) return;

  // Initialize ping so it has 2 minutes to receive the first real heartbeat
  lastPing[connectionId] = Date.now();

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: connectionId }),
    qrMaxRetries: 3, // Stop generating QR codes if not scanned after 3 attempts
    puppeteer: {
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-extensions',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  let qrCount = 0;
  client.on('qr', async (qr) => {
    // Save QR code in memory so the frontend can poll it
    qrCodes[connectionId] = qr;
    if (qrCount === 0) {
      console.log(`[WhatsApp ${connectionId}] Initial QR Code Generated (waiting for scan...)`);
    } else {
      console.log(`[WhatsApp ${connectionId}] QR Code Regenerated (Attempt ${qrCount + 1})`);
    }
    qrCount++;
  });

  client.on('ready', async () => {
    console.log(`[WhatsApp ${connectionId}] Client is ready!`);
    delete qrCodes[connectionId]; // Clear QR

    // Extract actual WhatsApp info
    let number = client.info?.wid?.user || null;
    const pushname = client.info?.pushname || '';
    let platform = client.info?.platform || '';

    // Map internal platform codes to professional names
    if (platform === 'smba') platform = 'WA Business (Android)';
    else if (platform === 'smbi') platform = 'WA Business (iOS)';
    else if (platform === 'android') platform = 'Android';
    else if (platform === 'ios') platform = 'iOS';
    else if (platform) platform = platform.charAt(0).toUpperCase() + platform.slice(1);

    if (number) {
      number = '+' + number;
      
      let finalName = pushname ? `${pushname} (${platform || 'Phone'})` : `WhatsApp (${number})`;
      
      // Update phone number and real name now that it's ready
      // @ts-ignore
      await prisma.whatsAppConnection.updateMany({
        where: { id: connectionId },
        data: { 
          number,
          name: finalName
        }
      });
    }
  });

  let isAuthenticatedHandled = false;
  client.on('authenticated', async () => {
    if (isAuthenticatedHandled) return;
    isAuthenticatedHandled = true;

    console.log(`[WhatsApp ${connectionId}] Authenticated`);
    delete qrCodes[connectionId]; // Clear QR immediately

    try {
      // Mark as connected immediately so UI updates fast (even before messages sync)
      // @ts-ignore
      await prisma.whatsAppConnection.upsert({
        where: { id: connectionId },
        update: {
          status: 'connected',
        },
        create: {
          id: connectionId,
          userId,
          name,
          status: 'connected',
          number: 'Loading...' // will be updated in 'ready'
        }
      });
    } catch (err: any) {
      if (err.code !== 'P2002') {
        console.error(`[WhatsApp ${connectionId}] Error in authenticated event:`, err);
      }
    }
  });

  client.on('auth_failure', async (msg) => {
    console.error(`[WhatsApp ${connectionId}] Auth failure`, msg);
    // @ts-ignore
    await prisma.whatsAppConnection.updateMany({
      where: { id: connectionId },
      data: { status: 'disconnected' }
    });
    delete qrCodes[connectionId];
  });

  client.on('disconnected', async (reason) => {
    console.log(`[WhatsApp ${connectionId}] Client was disconnected`, reason);
    // @ts-ignore
    await prisma.whatsAppConnection.updateMany({
      where: { id: connectionId },
      data: { status: 'disconnected' }
    });
    delete clients[connectionId];
    delete qrCodes[connectionId];
  });

  clients[connectionId] = client;
  await client.initialize();
}

export async function disconnectWhatsAppClient(connectionId: string) {
  const client = clients[connectionId];
  if (client) {
    try {
      // logout only works if already authenticated
      await client.logout().catch(() => {});
    } catch (err) {
      console.error(`[WhatsApp ${connectionId}] Error logging out`, err);
    }
    
    try {
      // destroy always closes the browser
      await client.destroy();
    } catch (err) {
      console.error(`[WhatsApp ${connectionId}] Error destroying client`, err);
    }

    delete clients[connectionId];
    delete qrCodes[connectionId];
    delete lastPing[connectionId];
  }
}

export async function restoreSessions() {
  try {
    // @ts-ignore
    const connections = await prisma.whatsAppConnection.findMany({
      where: { status: 'connected' }
    });
    
    for (const conn of connections) {
      console.log(`[WhatsApp ${conn.id}] Restoring session from database...`);
      initializeWhatsAppClient(conn.id, conn.userId, conn.name).catch(console.error);
    }
  } catch (err) {
    console.error('[WhatsApp Restore] Error restoring sessions:', err);
  }
}
