import apiClient from "../apiConfig";

const BASE_URL = "/dashboard";

export const getDashboardData = () => apiClient.get(BASE_URL);
