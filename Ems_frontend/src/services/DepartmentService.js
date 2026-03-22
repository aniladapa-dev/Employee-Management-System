import apiClient from "../apiConfig";

const BASE_URL = "/departments";

export const getAllDepartments = () => apiClient.get(BASE_URL);
export const createDepartment = (department) => apiClient.post(BASE_URL, department);
export const getDepartmentById = (id) => apiClient.get(`${BASE_URL}/${id}`);
export const updateDepartment = (id, department) => apiClient.put(`${BASE_URL}/${id}`, department);
export const deleteDepartment = (id) => apiClient.delete(`${BASE_URL}/${id}`);
