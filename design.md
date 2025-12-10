# Patient Portal - Design Document

## 1. Tech Stack Choices

### Q1. Frontend Framework: React
**Choice:** React with Vite
**Reasoning:**
- Component-based architecture makes it easy to build reusable UI components
- Large ecosystem and excellent documentation
- Vite provides fast development experience with hot module replacement
- Built-in state management with hooks is sufficient for this simple application

### Q2. Backend Framework: Node.js with Express
**Choice:** Express.js
**Reasoning:**
- Lightweight and flexible framework
- Excellent middleware ecosystem for file uploads (multer)
- JSON-first approach works well with React frontend
- Fast development cycle and easy to understand
- Great for handling file operations and REST APIs

### Q3. Database: SQLite
**Choice:** SQLite
**Reasoning:**
- Zero configuration required - perfect for local development
- File-based database that's easy to set up and distribute
- Sufficient for single-user application requirements
- Built-in support in Node.js ecosystem
- Easy to migrate to PostgreSQL later if needed

### Q4. Scaling to 1,000 Users - Considerations:
- **Database:** Migrate to PostgreSQL for better concurrent access
- **File Storage:** Move to cloud storage (AWS S3, Google Cloud Storage)
- **Authentication:** Implement user authentication and authorization
- **Caching:** Add Redis for session management and caching
- **Load Balancing:** Use nginx for load balancing multiple server instances
- **CDN:** Implement CDN for faster file downloads
- **Database Indexing:** Add proper indexes on frequently queried fields
- **Rate Limiting:** Implement API rate limiting to prevent abuse

## 2. Architecture Overview

```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐
│   React Frontend│ ──────────────────► │  Express Backend│
│   (Port 5173)   │                     │   (Port 3000)   │
└─────────────────┘                     └─────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │   SQLite DB     │
                                        │  (documents)    │
                                        └─────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │  File System    │
                                        │   (uploads/)    │
                                        └─────────────────┘
```

**Flow:**
1. User interacts with React frontend (single App.jsx file)
2. Frontend makes HTTP requests to Express API (single server.js file)
3. Backend processes requests, updates SQLite database
4. Files are stored in local uploads/ directory
5. Metadata is stored in SQLite database
6. Response sent back to frontend

**Simplified Architecture:**
- **Frontend**: Single App.jsx file contains all components and logic
- **Backend**: Single server.js file contains all routes, database, and file handling
- **Environment**: Configurable via .env files for both frontend and backend

## 3. API Specification

### POST /documents/upload
**Description:** Upload a PDF file
**Request:**
- Content-Type: multipart/form-data
- Body: PDF file in 'document' field

**Sample Request:**
```bash
curl -X POST http://localhost:3000/documents/upload \
  -F "document=@test.pdf"
```

**Sample Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "filename": "test.pdf",
    "filesize": 245760,
    "created_at": "2024-12-10T10:30:00.000Z"
  }
}
```

### GET /documents
**Description:** List all uploaded documents
**Request:** No body required

**Sample Request:**
```bash
curl http://localhost:3000/documents
```

**Sample Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "filename": "test.pdf",
      "filesize": 245760,
      "created_at": "2024-12-10T10:30:00.000Z"
    }
  ]
}
```

### GET /documents/:id
**Description:** Download a specific file
**Request:** Document ID in URL parameter

**Sample Request:**
```bash
curl http://localhost:3000/documents/1 --output downloaded.pdf
```

**Sample Response:**
- Content-Type: application/pdf
- File content as binary data

### DELETE /documents/:id
**Description:** Delete a document
**Request:** Document ID in URL parameter

**Sample Request:**
```bash
curl -X DELETE http://localhost:3000/documents/1
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## 4. Data Flow Description

### Q5. File Upload Process:
1. User selects PDF file in React frontend
2. Frontend validates file type (PDF only)
3. File is sent via FormData to POST /documents/upload
4. Backend receives file using multer middleware
5. File is saved to uploads/ directory with unique filename
6. File metadata (original name, size, timestamp) is stored in SQLite
7. Database returns generated ID
8. Success response sent to frontend with document metadata
9. Frontend updates UI to show new document in list

### File Download Process:
1. User clicks download button in frontend
2. Frontend makes GET request to /documents/:id
3. Backend queries database for document metadata
4. Backend reads file from uploads/ directory
5. File is streamed back to client with appropriate headers
6. Browser initiates file download

## 5. Assumptions

### Q6. Assumptions Made:
- **Single User:** No authentication required - assumes single user system
- **File Size Limit:** Maximum 10MB per PDF file
- **File Types:** Only PDF files are allowed
- **Concurrent Access:** No concurrent user access considerations
- **Error Handling:** Basic error handling for common scenarios
- **File Storage:** Local file system storage is acceptable
- **Database:** SQLite is sufficient for development/demo purposes
- **Security:** No advanced security measures (CORS, CSRF protection)
- **Backup:** No backup/recovery mechanisms implemented
- **Monitoring:** No logging or monitoring systems
- **Performance:** No optimization for large numbers of files