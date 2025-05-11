import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Chat() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName;
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    loadChatHistory();
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    async function fetchCompanyInfo() {
      if (companyId) {
        try {
          const companyDoc = await getDoc(doc(db, 'operating_companies', companyId));
          if (companyDoc.exists()) {
            setCompanyInfo(companyDoc.data());
          }
        } catch (e) {
          setCompanyInfo(null);
        }
      } else {
        setCompanyInfo(null);
      }
    }
    fetchCompanyInfo();
  }, [companyId]);

  const loadChatHistory = async () => {
    if (currentUser) {
      try {
        const history = await chatService.getChatHistory(currentUser.uid);
        setChatHistory(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    setLoading(true);
    try {
      const response = await chatService.sendMessage(currentUser.uid, message, companyId ? { companyId, companyName } : undefined);
      setChatHistory(prev => [...prev, {
        message,
        response,
        timestamp: new Date().toISOString(),
      }]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        AI Assistant
        {companyName && (
          <span style={{ fontSize: '1rem', color: '#888', marginLeft: 8 }}>
            (Company: {companyName})
          </span>
        )}
      </Typography>

      {companyInfo && (
        <Paper sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{companyInfo.name}</Typography>
          <Typography variant="body2">Industry: {companyInfo.industry}</Typography>
          <Typography variant="body2">{companyInfo.description}</Typography>
        </Paper>
      )}

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          overflow: 'auto',
          p: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <List>
          {chatHistory.map((chat, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ fontWeight: 'bold' }}
                    >
                      You:
                    </Typography>
                  }
                  secondary={chat.message}
                />
              </ListItem>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      AI Assistant:
                    </Typography>
                  }
                  secondary={chat.response}
                />
              </ListItem>
              {index < chatHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Paper
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={!message.trim() || loading}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Paper>
    </Box>
  );
} 