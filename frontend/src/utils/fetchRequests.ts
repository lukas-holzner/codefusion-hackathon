export const fetchConversation = async ({ meetingId, userId }: {meetingId: number, userId: number}) => {
	const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}/${userId}/conversation`);
	if (!response.ok) {
	  throw new Error('Failed to fetch conversation');
	}
	return response.json();
};

export const fetchMeetingDetails = async ({ meetingId }: {meetingId: number}) => {
	const response = await fetch(`https://codefusion.lholz.de/meetings/${meetingId}`);
	if (!response.ok) {
	  throw new Error('Failed to fetch meeting details');
	}
	return response.json();
};
