import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  Typography,
  Avatar,
  Card
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import './Meeting.css';

const sendMessage = async ({ message, meetingId }) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, meetingId }),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const Meeting = () => {
	const { id } = useParams();
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState('');
	const messagesEndRef = useRef(null);
	const queryClient = useQueryClient();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(scrollToBottom, [messages]);

	useEffect(() => {
		setMessages([]);
	}, [id]);

	const mutation = useMutation({
		mutationFn: sendMessage,
		onSuccess: (data) => {
			setMessages(prevMessages => [...prevMessages, { text: data.response, sender: 'api' }]);
			queryClient.invalidateQueries('messages');
		},
		onError: (error) => {
			console.error('Error:', error);
			setMessages(prevMessages => [...prevMessages, { text: 'Error: Could not get response', sender: 'error' }]);
		}
	});

	const handleSendMessage = () => {
		if (inputMessage.trim() === '') return;

		setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
		mutation.mutate({ message: inputMessage, meetingId: id });
		setInputMessage('');
	};

	return (
		<Box className="MeetingContainer">
			<Typography variant="h4" gutterBottom>
				Meeting: {id}
			</Typography>
			<div className="ChatContainer">
				<List>
					{messages.map((message, index) => (
						<ListItem
							key={index}
							sx={{
								display: 'flex',
								justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
								mb: 2,
							}}
							className="MessageItem"
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
									alignItems: 'center',
								}}
							>
								<Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main', mr: message.sender === 'user' ? 0 : 1, ml: message.sender === 'user' ? 1 : 0 }}>
									{message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
								</Avatar>
								<Paper
									elevation={3}
									sx={{
										p: 2,
										bgcolor: message.sender === 'user' ? 'primary.light' : 'secondary.light',
										maxWidth: '70%',
										borderRadius: 4,
										borderTopRightRadius: message.sender === 'user' ? 0 : 16,
										borderTopLeftRadius: message.sender === 'user' ? 16 : 0,
										wordBreak: 'break-word',
										whiteSpace: 'pre-wrap',
									}}
								>
									<Typography variant="body1">{message.text}</Typography>
								</Paper>
							</Box>
						</ListItem>
					))}
					<div ref={messagesEndRef} />
				</List>
			</div>
			<Box sx={{ display: 'flex', mb: 2 }}>
				<TextField
					fullWidth
					autoFocus
					variant="outlined"
					placeholder="Type your message..."
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === 'Enter') {
							handleSendMessage();
						}
					}}
				/>
				<Button
					variant="contained"
					color="primary"
					endIcon={<SendIcon />}
					onClick={handleSendMessage}
					disabled={mutation.isPending}
					sx={{ ml: 1 }}
				>
					{mutation.isPending ? 'Sending...' : 'Send'}
				</Button>
			</Box>
		</Box>
	);
};
