import apiClient from "../apiConfig";

const REST_API_BASE_URL = "/announcements";

export const listAnnouncements = () => apiClient.get(REST_API_BASE_URL);

export const createAnnouncement = (announcement) => apiClient.post(REST_API_BASE_URL, announcement);
