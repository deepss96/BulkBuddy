require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const clients = {};
const qrCodes = {};
const statuses = {}; // 'connecting', 'connected', 'disconnected', 'failed'
const clientInfo = {};

app.post('/api/whatsapp/init', async (req, res) => {
  const { connectionId, userAgent } = req.body;
  if (!connectionId) return res.status(400).json({ error: 'Missing connectionId' });

  if (clients[connectionId]) return res.json({ success: true, message: 'Already running' });

  statuses[connectionId] = 'connecting';
  
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: connectionId }),
    authTimeoutMs: 120000,
    qrMaxRetries: 5,
    userAgent: userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    qrCodes[connectionId] = qr;
    console.log(`[WhatsApp ${connectionId}] QR Code generated`);
  });

  client.on('ready', () => {
    delete qrCodes[connectionId];
    statuses[connectionId] = 'connected';
    
    let number = client.info?.wid?.user || null;
    const pushname = client.info?.pushname || '';
    let platform = client.info?.platform || '';

    if (platform === 'smba') platform = 'WA Business (Android)';
    else if (platform === 'smbi') platform = 'WA Business (iOS)';
    else if (platform) platform = platform.charAt(0).toUpperCase() + platform.slice(1);

    if (number) {
      number = '+' + number;
      const finalName = pushname ? `${pushname} (${platform || 'Phone'})` : `WhatsApp (${number})`;
      clientInfo[connectionId] = { number, name: finalName };
    }
    console.log(`[WhatsApp ${connectionId}] Client ready`);
  });

  client.on('authenticated', () => {
    delete qrCodes[connectionId];
    statuses[connectionId] = 'connected';
    console.log(`[WhatsApp ${connectionId}] Authenticated`);
  });

  client.on('auth_failure', () => {
    statuses[connectionId] = 'failed';
    delete qrCodes[connectionId];
  });

  client.on('disconnected', () => {
    statuses[connectionId] = 'disconnected';
    delete clients[connectionId];
    delete qrCodes[connectionId];
    delete clientInfo[connectionId];
  });

  clients[connectionId] = client;

  try {
    client.initialize().catch(err => {
      console.error(`[WhatsApp ${connectionId}] Init Error:`, err);
      statuses[connectionId] = 'failed';
      delete clients[connectionId];
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/whatsapp/qr/:id', (req, res) => {
  const { id } = req.params;
  const status = statuses[id];
  const qr = qrCodes[id];
  const info = clientInfo[id];

  if (!status) return res.status(404).json({ error: 'Not found' });
  
  res.json({ status, qr: qr || null, info });
});

app.post('/api/whatsapp/disconnect/:id', async (req, res) => {
  const { id } = req.params;
  const client = clients[id];
  if (client) {
    await client.logout().catch(() => {});
    await client.destroy().catch(() => {});
    delete clients[id];
    delete qrCodes[id];
    delete statuses[id];
    delete clientInfo[id];
  }
  res.json({ success: true });
});

app.post('/api/whatsapp/group', async (req, res) => {
  const { connectionId, name, participants, description, dp } = req.body;
  const client = clients[connectionId];
  
  if (!client) return res.status(400).json({ error: 'Client not connected' });
  if (!name || !participants) return res.status(400).json({ error: 'Missing name or participants' });

  try {
    const result = await client.createGroup(name, participants);
    let chat = null;
    if (result.gid) {
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          chat = await client.getChatById(result.gid._serialized);
          if (chat) break;
        } catch (err) {}
      }
      
      if (chat) {
        if (description) await chat.setDescription(description).catch(() => {});
        if (dp) {
          const matches = dp.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (matches) {
             const media = new MessageMedia(matches[1], matches[2], 'dp.jpg');
             await chat.setPicture(media).catch(() => {});
          }
        }
      }
    }
    res.json({ success: true, gid: result.gid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/validate', async (req, res) => {
  const { connectionId, numbers } = req.body;
  const client = clients[connectionId];
  
  if (!client) return res.status(400).json({ error: 'Client not connected' });

  const results = [];
  for (const number of numbers) {
    try {
      const cleanPhone = number.replace(/[^\d]/g, '');
      const isRegistered = await client.isRegisteredUser(`${cleanPhone}@c.us`);
      results.push({ phone: number, isWhatsAppRegistered: isRegistered });
    } catch (err) {
      results.push({ phone: number, isWhatsAppRegistered: false });
    }
  }
  res.json({ results });
});

app.get('/api/whatsapp/groups/:id', async (req, res) => {
  const client = clients[req.params.id];
  if (!client) return res.status(400).json({ error: 'Client not connected' });
  
  try {
    const chats = await client.getChats();
    const groups = chats.filter(c => c.isGroup).map(g => ({
      id: g.id._serialized,
      name: g.name || 'Unknown Group',
      members: g.participants?.length || 0
    }));
    res.json({ groups });
  } catch (err) {
    try {
      const rawGroups = await client.pupPage.evaluate(() => {
        const w = window;
        const chats = w.Store ? (w.Store.Chat ? w.Store.Chat.getModelsArray() : []) : [];
        return chats.filter(c => c.isGroup).map(c => ({
          id: c.id._serialized,
          name: c.formattedTitle || c.name || 'Unknown Group',
          members: c.participants ? c.participants.length : 0
        }));
      });
      res.json({ groups: rawGroups });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`WhatsApp Microservice running on port ${PORT}`);
});
