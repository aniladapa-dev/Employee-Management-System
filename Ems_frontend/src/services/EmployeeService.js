import apiClient from "../apiConfig";

const REST_API_BASE_URL = "/employees";

export const listEmployees = (query = '', departmentId = '', teamId = '') => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (departmentId) params.append('departmentId', departmentId);
  if (teamId) params.append('teamId', teamId);
  params.append('size', '100'); // Default to 100 to show more employees
  return apiClient.get(REST_API_BASE_URL + '?' + params.toString());
};

export const getEmployeesByDesignation = (designation) => apiClient.get(`${REST_API_BASE_URL}/designation/${designation}`);

export const getEmployeesBySkill = (skillName) => apiClient.get(`${REST_API_BASE_URL}/skill/${skillName}`);

export const addSkillToEmployee = (employeeId, skillName) => apiClient.post(`${REST_API_BASE_URL}/${employeeId}/skills?skillName=${skillName}`);


export const createEmployee = (employee) => apiClient.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) => apiClient.get(REST_API_BASE_URL + '/' + employeeId);

export const updateEmployee = (employeeId, employee) => apiClient.put(REST_API_BASE_URL + '/' + employeeId, employee);
  
export const deleteEmployee = (employeeId) => apiClient.delete(REST_API_BASE_URL + '/' + employeeId);

export const getLoggedInEmployee = () => apiClient.get(REST_API_BASE_URL + '/me');