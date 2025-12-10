# Patient Portal - Document Management System

A full-stack web application that allows patients to upload, view, download, and delete their medical documents (PDFs). Built with React frontend and Node.js/Express backend.

## Features

- **Upload PDF Documents**: Secure file upload with validation (PDF only, 10MB max)
- **View Document List**: Display all uploaded documents with metadata
- **Download Documents**: Download any uploaded document
- **Delete Documents**: Remove documents when no longer needed
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: SQLite
- **File Storage**: Local file system
- **File Upload**: Multer middleware

## Project Structure

```
patient-portal/
├── design.md              # Design document with architecture and decisions
├── README.md              # This file
├── .gitignore             # Git ignore file
├── backend/               # Express.js API server
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment variables example
│   ├── package.json       # Backend dependencies
│   ├── server.js          # Main server file (all backend logic)
│   ├── uploads/           # File storage directory (created automatically)
│   └── documents.db       # SQLite database (created automatically)
└── frontend/              # React application
    ├── .env               # Environment variables
    ├── .env.example       # Environment variables example
    ├── package.json       # Frontend dependencies
    ├── vite.config.js     # Vite configuration
    ├── index.html         # HTML template
    └── src/
        ├── main.jsx       # React entry point
        ├── App.jsx        # Main application component (all frontend logic)
        └── index.css      # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-portal
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Backend environment variables are already configured in `backend/.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_NAME=documents.db
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=10485760
   CORS_ORIGIN=http://localhost:5173
   ```
   
   Frontend environment variables are already configured in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   VITE_APP_NAME=Patient Portal
   VITE_MAX_FILE_SIZE=10485760
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on http://localhost:3000

6. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on http://localhost:5173

7. **Open your browser**
   Navigate to http://localhost:5173 to use the application

## API Documentation

### Base URL
```
http://localhost:3000
```

**Note:** The API base URL is configurable via the `VITE_API_BASE_URL` environment variable in the frontend and `PORT` in the backend.

### Endpoints

#### Upload Document
```bash
POST /documents/upload
Content-Type: multipart/form-data

# Example with curl
curl -X POST http://localhost:3000/documents/upload \
  -F "document=@path/to/your/file.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "filename": "medical-report.pdf",
    "filesize": 245760,
    "created_at": "2024-12-10T10:30:00.000Z"
  }
}
```

#### List All Documents
```bash
GET /documents

# Example with curl
curl http://localhost:3000/documents
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "filename": "medical-report.pdf",
      "filepath": "/path/to/uploads/file.pdf",
      "filesize": 245760,
      "created_at": "2024-12-10T10:30:00.000Z"
    }
  ]
}
```

#### Download Document
```bash
GET /documents/:id

# Example with curl
curl http://localhost:3000/documents/1 --output downloaded-file.pdf
```

**Response:** Binary PDF file with appropriate headers

#### Delete Document
```bash
DELETE /documents/:id

# Example with curl
curl -X DELETE http://localhost:3000/documents/1
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Example API Calls with Postman

### Upload Document
- Method: POST
- URL: `http://localhost:3000/documents/upload`
- Body: form-data
  - Key: `document` (File)
  - Value: Select a PDF file

### List Documents
- Method: GET
- URL: `http://localhost:3000/documents`

### Download Document
- Method: GET
- URL: `http://localhost:3000/documents/1`
- Save Response: Check "Send and Download"

### Delete Document
- Method: DELETE
- URL: `http://localhost:3000/documents/1`

## Database Schema

### documents table
```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## File Validation

- **File Type**: Only PDF files are accepted
- **File Size**: Maximum 10MB per file
- **Storage**: Files are stored in `backend/uploads/` directory
- **Naming**: Files are renamed with timestamp to avoid conflicts

## Error Handling

The application handles various error scenarios:
- Invalid file types (non-PDF)
- File size exceeding limits
- Database connection issues
- File system errors
- Network connectivity problems

## Security Considerations

- File type validation on both frontend and backend
- File size limits to prevent abuse
- CORS enabled for frontend-backend communication
- Input validation and sanitization
- Error messages don't expose sensitive information

## Development Notes

- **Simple Structure**: All backend logic in `server.js`, all frontend logic in `App.jsx`
- **Environment Variables**: Configurable URLs and settings via `.env` files
- **Single User**: No authentication required - assumes single user system
- **Auto Setup**: SQLite database and uploads directory created automatically
- **Form Validation**: Built-in file type and size validation
- **Error Handling**: Comprehensive error handling for all scenarios

## Production Considerations

For production deployment, consider:
- Implementing user authentication and authorization
- Using cloud storage (AWS S3, Google Cloud Storage)
- Migrating to PostgreSQL or MySQL
- Adding rate limiting and security headers
- Implementing logging and monitoring
- Adding backup and recovery mechanisms
- Using environment variables for configuration

## Troubleshooting

### Backend won't start
- Ensure Node.js is installed (v16+)
- Check if port 3000 is available
- Verify all dependencies are installed

### Frontend won't start
- Ensure Node.js is installed (v16+)
- Check if port 5173 is available
- Verify all dependencies are installed

### File upload fails
- Check file is PDF format
- Ensure file size is under 10MB
- Verify backend server is running
- Check browser console for errors

### Database issues
- SQLite database is created automatically
- Check file permissions in project directory
- Restart backend server if database seems corrupted