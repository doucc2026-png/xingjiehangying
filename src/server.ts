import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'node:fs';

const browserDistFolder = join(import.meta.dirname, '../browser');
const dataFolder = join(import.meta.dirname, '../../data');
const uploadsFolder = join(dataFolder, 'uploads');
const dbFilePath = join(dataFolder, 'db.json');

// Ensure directories exist
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({ contents: [] }), 'utf-8');
}

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));

app.use('/api/uploads', express.static(uploadsFolder));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsFolder);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB limit to handle very large files
});

function getDb() {
  const data = fs.readFileSync(dbFilePath, 'utf-8');
  return JSON.parse(data);
}

function saveDb(data: any) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes
app.get('/api/contents', (req, res) => {
  const type = req.query['type'] as string;
  const db = getDb();
  let contents = db.contents;
  if (type) {
    contents = contents.filter((c: any) => c.type === type);
  }
  // Sort by createdAt descending
  contents.sort((a: any, b: any) => b.createdAt - a.createdAt);
  res.json(contents);
});

app.post('/api/contents', upload.array('files'), (req, res) => {
  const type = req.body.type;
  const title = req.body.title;
  const description = req.body.description || '';
  const files = req.files as Express.Multer.File[];
  
  if (!type || !title) {
    res.status(400).json({ error: 'Type and title are required' });
    return;
  }

  const db = getDb();
  
  // Articles can have text content instead of files
  if (type === 'article' && !files?.length) {
    const content = req.body.content || '';
    const newContent = {
      id: uuidv4(),
      type,
      title,
      description,
      content,
      createdAt: Date.now(),
    };
    db.contents.push(newContent);
    saveDb(db);
    res.json(newContent);
    return;
  }

  // Videos and Images
  if (!files || files.length === 0) {
     res.status(400).json({ error: 'Files are required for images and videos' });
     return;
  }

  const newItems: any[] = [];
  for (const file of files) {
    const newContent = {
      id: uuidv4(),
      type,
      title: files.length > 1 ? `${title} - ${file.originalname}` : title,
      description,
      fileUrl: `/api/uploads/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      createdAt: Date.now(),
    };
    db.contents.push(newContent);
    newItems.push(newContent);
  }
  
  saveDb(db);
  res.json(newItems.length === 1 ? newItems[0] : newItems);
});

app.put('/api/contents/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, content } = req.body;
  const db = getDb();
  const itemIndex = db.contents.findIndex((c: any) => c.id === id);
  
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  if (title) db.contents[itemIndex].title = title;
  if (description !== undefined) db.contents[itemIndex].description = description;
  if (content !== undefined) db.contents[itemIndex].content = content;
  
  saveDb(db);
  res.json(db.contents[itemIndex]);
});

app.delete('/api/contents/:id', (req, res) => {
  const id = req.params.id;
  const db = getDb();
  const itemIndex = db.contents.findIndex((c: any) => c.id === id);
  
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const item = db.contents[itemIndex];
  if (item.fileUrl) {
    const filename = item.fileUrl.split('/').pop();
    const filePath = join(uploadsFolder, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  db.contents.splice(itemIndex, 1);
  saveDb(db);
  res.json({ success: true });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
