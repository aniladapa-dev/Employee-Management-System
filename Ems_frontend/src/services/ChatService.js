import apiClient from "../apiConfig";

export const getPrivateChatHistory = (username) => apiClient.get(`/chat/private/${username}`);

export const getRecentContactTimestamps = () => apiClient.get('/chat/recent-contacts');

export const getGroupChatHistory = (groupId) => apiClient.get(`/chat/group/${groupId}`);
