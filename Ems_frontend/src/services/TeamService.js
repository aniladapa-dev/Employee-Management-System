import apiClient from "../apiConfig";

const BASE_URL = "/teams";

export const getAllTeams = (departmentId = '') => {
  const url = departmentId ? `${BASE_URL}?departmentId=${departmentId}&size=100` : `${BASE_URL}?size=100`;
  return apiClient.get(url);
};
export const createTeam = (team) => apiClient.post(BASE_URL, team);
export const getTeamById = (id) => apiClient.get(`${BASE_URL}/${id}`);
export const updateTeam = (id, team) => apiClient.put(`${BASE_URL}/${id}`, team);
export const deleteTeam = (id) => apiClient.delete(`${BASE_URL}/${id}`);
