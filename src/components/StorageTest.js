import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storageService';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
} from '@mui/icons-material';

export default function StorageTest() {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    setLoading(true);
    setError('');

    try {
      // Create a test path in the user's storage space
      const path = `users/${currentUser.uid}/test/${file.name}`;
      const result = await storageService.uploadFile(file, path);
      
      // Refresh the file list
      await loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please check the console for details.');
    }

    setLoading(false);
  };

  const loadFiles = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userFiles = await storageService.listFiles(`users/${currentUser.uid}/test`);
      setFiles(userFiles);
    } catch (error) {
      console.error('Load error:', error);
      setError('Failed to load files. Please check the console for details.');
    }
    setLoading(false);
  };

  const handleDelete = async (path) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await storageService.deleteFile(path);
      await loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file. Please check the console for details.');
    }
    setLoading(false);
  };

  // Load files when component mounts
  React.useEffect(() => {
    loadFiles();
  }, [currentUser]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Storage Test
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {currentUser?.role === 'admin' && (
        <Box sx={{ mb: 3 }}>
          <input
            accept="*/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              Upload Test File
            </Button>
          </label>
        </Box>
      )}

      {loading && <CircularProgress sx={{ mb: 2 }} />}

      <List>
        {files.map((file) => (
          <ListItem
            key={file.path}
            secondaryAction={
              currentUser?.role === 'admin' && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(file.path)}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  View File
                </a>
              }
            />
          </ListItem>
        ))}
      </List>

      {files.length === 0 && !loading && (
        <Typography color="text.secondary">
          No files uploaded yet. Try uploading a test file.
        </Typography>
      )}
    </Box>
  );
} 