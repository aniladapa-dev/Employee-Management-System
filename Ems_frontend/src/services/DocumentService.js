import apiClient from "../apiConfig";

const REST_API_BASE_URL = "/documents";

export const uploadDocument = (employeeId, file) => {
    const formData = new FormData();
    formData.append('employeeId', employeeId);
    formData.append('file', file);
    return apiClient.post(`${REST_API_BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const listDocuments = (employeeId) => apiClient.get(`${REST_API_BASE_URL}/${employeeId}`);

export const downloadDocument = (documentId) => {
    return apiClient.get(`${REST_API_BASE_URL}/download/${documentId}`, {
        responseType: 'blob'
    });
};
