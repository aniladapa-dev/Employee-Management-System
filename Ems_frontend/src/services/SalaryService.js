import apiClient from "../apiConfig";

const BASE_URL = "/salary";

// Admin Section
export const updateEmployeeSalary = (empId, updateDto) => apiClient.put(`${BASE_URL}/${empId}`, updateDto);
export const generateMonthlySalary = (generateDto) => apiClient.post(`${BASE_URL}/generate`, generateDto);
export const getAllSalaryRecords = () => apiClient.get(`${BASE_URL}/records`);
export const markSalaryAsPaid = (recordId) => apiClient.put(`${BASE_URL}/records/${recordId}/pay`);
export const payAllSalaries = (month, year) => apiClient.put(`${BASE_URL}/records/pay-all`, null, { params: { month, year } });

// General Section (Role-based access handled by backend)
export const getEmployeeSalary = (empId) => apiClient.get(`${BASE_URL}/${empId}`);
export const getSalaryHistory = (empId) => apiClient.get(`${BASE_URL}/history/${empId}`);
export const getSalaryRecordsByEmployee = (empId) => apiClient.get(`${BASE_URL}/records/${empId}`);
