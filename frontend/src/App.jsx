import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Patient Portal';
const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024;

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/documents`);
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      showMessage('Failed to fetch documents', 'error');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      return 'Please select a PDF file only';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        showMessage(error, 'error');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      showMessage('Please select a file to upload', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showMessage('File uploaded successfully!', 'success');
        setSelectedFile(null);
        document.getElementById('file-input').value = '';
        fetchDocuments();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      showMessage(errorMessage, 'error');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showMessage('File downloaded successfully!', 'success');
    } catch (error) {
      showMessage('Failed to download file', 'error');
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (documentId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
      
      if (response.data.success) {
        showMessage('File deleted successfully!', 'success');
        fetchDocuments();
      }
    } catch (error) {
      showMessage('Failed to delete file', 'error');
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>{APP_NAME}</h1>
        <p>Upload and manage your medical documents securely</p>
      </header>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* File Upload */}
      <section className="upload-section">
        <h2>Upload New Document</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <label htmlFor="file-input">Select PDF Document:</label>
            <input
              id="file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFile && (
              <p>Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="upload-btn"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </section>

      {/* Document List */}
      <section className="documents-section">
        <h2>Your Documents</h2>
        
        {loading ? (
          <div className="loading">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <h3>No documents uploaded yet</h3>
            <p>Upload your first medical document using the form above.</p>
          </div>
        ) : (
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-info">
                  <div className="document-name">{doc.filename}</div>
                  <div className="document-meta">
                    Size: {formatFileSize(doc.filesize)} • 
                    Uploaded: {formatDate(doc.created_at)}
                  </div>
                </div>
                <div className="document-actions">
                  <button
                    onClick={() => handleDownload(doc.id, doc.filename)}
                    className="btn btn-download"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;