// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useUser } from '../../utils/userProvider';

const deleteConversation = async ({ meetingId, userId }) => {
	const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}/${userId}/conversation`, {
	  method: 'DELETE',
	  headers: {
		'Content-Type': 'application/json',
	  },
	});
	if (!response.ok) {
	  throw new Error('Failed to delete conversation');
	}
	return response.json();
};

const fetchConversation = async ({ meetingId, userId }) => {
	const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}/${userId}/conversation`);
	if (!response.ok) {
	  throw new Error('Failed to fetch conversation');
	}
	return response.json();
};

const sendMessage = async ({ message, meetingId, userId }) => {
  const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}/${userId}/conversation/message?message=${message}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const Meeting = () => {
	const { id: meetingId } = useParams();
	const { userId } = useUser();
	const navigate = useNavigate();

	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState('');
	const messagesEndRef = useRef(null);
	const queryClient = useQueryClient();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const { data: conversation, isLoading } = useQuery({
		queryKey: ['conversation', meetingId, userId],
		queryFn: () => fetchConversation({ meetingId, userId }),
		enabled: !!userId && !!meetingId,
	});

	const deleteMutation = useMutation({
		mutationFn: deleteConversation,
		onSuccess: () => {
		  queryClient.invalidateQueries(['conversation', meetingId, userId]);
		  setMessages([]);
		},
		onError: (error) => {
		  console.error('Error deleting conversation:', error);
		}
	});

	useEffect(scrollToBottom, [messages]);

	useEffect(() => {
		if (conversation) {
			setMessages(conversation.chat_messages);
		}
	}, [conversation]);

	const mutation = useMutation({
		mutationFn: sendMessage,
		onSuccess: (data) => {
			setMessages(() => data.chat_messages);

			if (data.finished) {
				navigate(`/meeting/${meetingId}/agenda`);
			}
		},
		onError: (error) => {
			console.error('Error:', error);
			setMessages(prevMessages => [...prevMessages, { message: 'Error: Could not get response', author: 'assistant' }]);
		}
	});

	const handleDeleteConversation = () => {
		if (window.confirm('Are you sure you want to delete this conversation?')) {
		  deleteMutation.mutate({ meetingId, userId });
		}
	};

	const handleSendMessage = () => {
		if (inputMessage.trim() === '') return;

		setMessages(prevMessages => [...prevMessages, { message: inputMessage, author: 'user' }]);

		mutation.mutate({ message: inputMessage, meetingId, userId });
		setInputMessage('');
	};

	return (
		<Box className="MeetingContainer">
			<Typography variant="h4" gutterBottom>
				Meeting: {meetingId}
			</Typography>
			<div className="ChatContainer">
				<List>
					{messages.map((message, index) => (
						<ListItem
							key={index}
							sx={{
								display: 'flex',
								justifyContent: message.author !== 'assistant' ? 'flex-end' : 'flex-start',
								mb: 2,
							}}
							className="MessageItem"
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: message.author !== 'assistant' ? 'row-reverse' : 'row',
									alignItems: 'center',
								}}
							>
								<Avatar sx={{ bgcolor: message.author !== 'assistant' ? 'primary.main' : 'secondary.main', mr: message.author !== 'assistant' ? 0 : 1, ml: message.author !== 'assistant' ? 1 : 0 }}>
									{message.author !== 'assistant' ? <PersonIcon /> : <SmartToyIcon />}
								</Avatar>
								<Paper
									elevation={3}
									sx={{
										p: 2,
										bgcolor: message.author !== 'assistant' ? 'primary.light' : 'secondary.light',
										maxWidth: '70%',
										borderRadius: 4,
										borderTopRightRadius: message.author !== 'assistant' ? 0 : 16,
										borderTopLeftRadius: message.author !== 'assistant' ? 16 : 0,
										wordBreak: 'break-word',
										whiteSpace: 'pre-wrap',
									}}
								>
									<Typography variant="body1">{message.message}</Typography>
								</Paper>
							</Box>
						</ListItem>
					))}
					<div ref={messagesEndRef} />
				</List>
				<Button
					variant="outlined"
					color="secondary"
					onClick={handleDeleteConversation}
					disabled={deleteMutation.isPending}
					sx={{ ml: 1 }}
				>
					{deleteMutation.isPending ? 'Clearing...' : 'Clear Conversation'}
				</Button>
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
