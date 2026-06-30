import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import cors from 'cors';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

const app = express();
app.use(cors());

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const angularApp = new AngularNodeAppEngine();

// Expose APP_URL for SSR
const getProdUrl = () => {
  if (process.env['APP_URL']) return process.env['APP_URL'];
  if (process.env['VERCEL_URL']) return `https://${process.env['VERCEL_URL']}`;
  return `http://localhost:${process.env['PORT'] || 3000}`;
};
(globalThis as unknown as { APP_URL?: string }).APP_URL = getProdUrl();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Data and Uploads (Local fallback)
const dataFolder = process.env['VERCEL'] ? '/tmp/data' : join(process.cwd(), 'data');
const uploadsFolder = join(dataFolder, 'uploads');

if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsFolder),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ storage });

// Admin Auth
const ADMIN_TOKEN = 'admin_secret_token_123';
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.headers.authorization === `Bearer ${ADMIN_TOKEN}`) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// API Routes
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      total: await getPrisma().content.count(),
      articles: await getPrisma().content.count({ where: { type: 'article' } }),
      videos: await getPrisma().content.count({ where: { type: 'video' } }),
      images: await getPrisma().content.count({ where: { type: 'image' } }),
      topics: await getPrisma().content.count({ where: { type: 'topic' } }),
    };
    res.json(stats);
  } catch {
    res.json({ total: 0, articles: 0, videos: 0, images: 0, topics: 0 });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    let settings = await getPrisma().settings.findFirst();
    if (!settings) settings = await getPrisma().settings.create({ data: {} });
    res.json(settings);
  } catch {
    res.json({ siteName: '星界航影', authorName: 'Jack.Jason' });
  }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    const settings = await getPrisma().settings.upsert({
      where: { id: 1 },
      update: req.body,
      create: { ...req.body, id: 1 }
    });
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.get('/api/contents', async (req, res) => {
  const type = req.query['type'] as string;
  try {
    const contents = await getPrisma().content.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: 'desc' }
    });
    res.json(contents);
  } catch {
    res.json([]);
  }
});

app.post('/api/contents', authMiddleware, upload.fields([{ name: 'files' }, { name: 'thumbnails' }]), async (req, res) => {
  const { type, title, description, content } = req.body;
  const filesMap = req.files as Record<string, Express.Multer.File[]>;
  const files = filesMap['files'] || [];
  const thumbnails = filesMap['thumbnails'] || [];

  try {
    if ((type === 'article' || type === 'topic') && files.length === 0) {
      const item = await getPrisma().content.create({
        data: { type, title, description, content, createdAt: new Date() }
      });
      res.json(item);
      return;
    }

    const createdItems = [];
    for (let i = 0; i < files.length; i++) {
      const item = await getPrisma().content.create({
        data: {
          type,
          title: files.length > 1 ? `${title} (${i+1})` : title,
          description,
          content: type === 'topic' ? content : undefined,
          fileUrl: `/api/uploads/${files[i].filename}`,
          thumbnailUrl: thumbnails[i] ? `/api/uploads/${thumbnails[i].filename}` : undefined,
          createdAt: new Date()
        }
      });
      createdItems.push(item);
    }
    res.json(createdItems.length === 1 ? createdItems[0] : createdItems);
  } catch {
    res.status(500).json({ error: 'Failed to create content' });
  }
});

app.delete('/api/contents/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params['id'];
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }
    await getPrisma().content.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.use('/api/uploads', express.static(uploadsFolder));

// Serve static files
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

// SSR
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => response ? writeResponseToNodeResponse(response, res) : next())
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 3000;
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}

export const reqHandler = createNodeRequestHandler(app);
export default app;
