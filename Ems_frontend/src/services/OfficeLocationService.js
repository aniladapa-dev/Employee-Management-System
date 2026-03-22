import apiClient from "../apiConfig";

const BASE_URL = "/office-location";

export const getAllOfficeLocations = () => apiClient.get(BASE_URL);
export const addOfficeLocation = (locationDto) => apiClient.post(BASE_URL, locationDto);
export const updateOfficeLocation = (id, locationDto) => apiClient.put(`${BASE_URL}/${id}`, locationDto);
export const deleteOfficeLocation = (id) => apiClient.delete(`${BASE_URL}/${id}`);
