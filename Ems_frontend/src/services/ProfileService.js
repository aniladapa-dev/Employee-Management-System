import apiClient from "../apiConfig";

const BASE_URL = "/profile";

export const getMyProfile = () => apiClient.get(`${BASE_URL}/me`);

export const getEmployeeProfile = (id) => apiClient.get(`${BASE_URL}/${id}`);

export const updateProfile = (updateDto) => apiClient.put(`${BASE_URL}/update`, updateDto);
