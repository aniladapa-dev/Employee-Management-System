import axios from "axios";
import apiClient from "../../apiConfig";

const AUTH_REST_API_BASE_URL = import.meta.env.VITE_API_URL + "/auth";
export const registerUser = (registerDto) => apiClient.post("/auth/register", registerDto);

export const loginUser = (loginDto) => axios.post(AUTH_REST_API_BASE_URL + "/login", loginDto);
export const changePassword = (oldPassword, newPassword) => apiClient.post("/auth/change-password", { oldPassword, newPassword });

export const storeToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const saveLoggedInUser = (username, role) => {
    sessionStorage.setItem("authenticatedUser", username);
    sessionStorage.setItem("role", role);
}

export const isUserLoggedIn = () => {
    const username = sessionStorage.getItem("authenticatedUser");
    return username != null;
}

export const getLoggedInUser = () => sessionStorage.getItem("authenticatedUser");
export const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
}
export const isAdminUser = () => {
    return sessionStorage.getItem("role") === 'ROLE_ADMIN';
}
