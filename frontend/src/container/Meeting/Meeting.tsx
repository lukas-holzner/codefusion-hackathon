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
  Card,
  useMediaQuery,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import { useTheme } from '@emotion/react';

import './Meeting.css';
import { useUser } from '../../utils/userProvider';
import { AgendaDrawer, AgendaDrawerWidth } from '../../components/AgendaDrawer/AgendaDrawer';
import { useAgenda } from '../../utils/meetingAgenda';
import { fetchConversation, fetchMeetingDetails } from '../../utils/fetchRequests';

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

export const Meeting: React.FC = () => {
	const { id: meetingId } = useParams<{ id: string }>();
	const { userId } = useUser();

	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const [messages, setMessages] = useState<any[]>([]);
	const [inputMessage, setInputMessage] = useState('');
	const [isAgendaDrawerOpen, setIsAgendaDrawerOpen] = useState(false);
	const [hasAgenda, setHasAgenda] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const { data: meetingDetails } = useQuery({
		queryKey: ['meeting', meetingId],
		queryFn: () => fetchMeetingDetails({ meetingId }),
		enabled: !!meetingId,
	});

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
			setHasAgenda(conversation.meeting_agenda.length > 0);
			setIsAgendaDrawerOpen(!isMobile && conversation.meeting_agenda.length > 0);

			if (conversation.finished) {
				navigate(`/meeting/${meetingId}/agenda`);
			}
		}
	}, [conversation, isMobile, meetingId, navigate]);

	const mutation = useMutation({
		mutationFn: sendMessage,
		onSuccess: (data) => {
			queryClient.invalidateQueries(['conversation', meetingId, userId]);

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
		<Box sx={{ display: 'flex' }}>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${isAgendaDrawerOpen && !isMobile ? AgendaDrawerWidth : 0}px)` },
					transition: theme.transitions.create(['margin', 'width'], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} className="MeetingHeader">
					<Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
						Meeting: {meetingDetails ? meetingDetails.title : '. . .'}
					</Typography>
					{isMobile && hasAgenda && (
						<IconButton onClick={() => setIsAgendaDrawerOpen(true)}>
							<ViewAgendaOutlinedIcon />
						</IconButton>
					)}
				</Box>
				
				<Box className="ChatContainer">
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
				</Box>
				
				<Box sx={{ display: 'flex', mt: 2 }}>
					<TextField
						fullWidth
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
			
			{hasAgenda && (
				<AgendaDrawer
					agendaItems={conversation?.meeting_agenda ?? []}
					isOpen={isAgendaDrawerOpen}
					onClose={() => setIsAgendaDrawerOpen(false)}
				/>
			)}
		</Box>
	);
};
