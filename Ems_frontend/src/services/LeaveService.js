import apiClient from "../apiConfig";

const BASE_URL = "/leaves";

export const applyLeave = (leaveRequest) => apiClient.post(BASE_URL, leaveRequest);
export const getEmployeeLeaves = (employeeId) => apiClient.get(`${BASE_URL}/employee/${employeeId}`);
export const getAllLeaves = () => apiClient.get(BASE_URL);
export const getPendingForMe = () => apiClient.get(`${BASE_URL}/pending-for-me`);
export const updateLeaveStatus = (id, status, remarks) => 
    apiClient.patch(`${BASE_URL}/${id}/status`, null, {
        params: { status, remarks }
    });

export const getLeaveBalance = (employeeId) => apiClient.get(`${BASE_URL}/balance/${employeeId}`);
