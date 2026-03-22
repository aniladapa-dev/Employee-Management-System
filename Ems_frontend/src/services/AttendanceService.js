import apiClient from "../apiConfig";

const BASE_URL = "/attendance";

export const checkIn = (employeeId, attendanceDto) => apiClient.post(`${BASE_URL}/check-in/${employeeId}`, attendanceDto);
export const checkOut = (employeeId) => apiClient.post(`${BASE_URL}/check-out/${employeeId}`);
export const approveAttendance = (id) => apiClient.patch(`${BASE_URL}/approve/${id}`);
export const rejectAttendance = (id) => apiClient.patch(`${BASE_URL}/reject/${id}`);
export const getEmployeeAttendance = (employeeId) => apiClient.get(`${BASE_URL}/employee/${employeeId}`);
export const getAttendanceByDate = (date) => apiClient.get(`${BASE_URL}/date/${date}`);
export const getHierarchyAttendance = (date, departmentId = '', teamId = '') => {
  const params = new URLSearchParams();
  if (departmentId) params.append('departmentId', departmentId);
  if (teamId) params.append('teamId', teamId);
  const qs = params.toString();
  return apiClient.get(`${BASE_URL}/hierarchy/${date}${qs ? '?' + qs : ''}`);
};
