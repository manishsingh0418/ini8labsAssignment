require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

// In-memory storage for documents (temporary solution)
let documents = [];
let nextId = 1;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Configure multer for memory storage (files stored in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Routes

// Upload a document
app.post('/documents/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or invalid file type'
    });
  }

  const document = {
    id: nextId++,
    filename: req.file.originalname,
    filesize: req.file.size,
    buffer: req.file.buffer, // Store file in memory
    created_at: new Date().toISOString()
  };

  documents.push(document);

  res.json({
    success: true,
    message: 'File uploaded successfully',
    document: {
      id: document.id,
      filename: document.filename,
      filesize: document.filesize,
      created_at: document.created_at
    }
  });
});

// Get all documents
app.get('/documents', (req, res) => {
  const documentList = documents.map(doc => ({
    id: doc.id,
    filename: doc.filename,
    filesize: doc.filesize,
    created_at: doc.created_at
  }));

  res.json({
    success: true,
    documents: documentList
  });
});

// Download a specific document
app.get('/documents/:id', (req, res) => {
  const documentId = parseInt(req.params.id);
  const document = documents.find(doc => doc.id === documentId);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
  res.send(document.buffer);
});

// Delete a document
app.delete('/documents/:id', (req, res) => {
  const documentId = parseInt(req.params.id);
  const index = documents.findIndex(doc => doc.id === documentId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  documents.splice(index, 1);

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

module.exports = app;