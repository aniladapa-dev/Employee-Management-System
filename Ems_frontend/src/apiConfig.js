import axios from "axios";
import { getToken } from "./services/auth/AuthService";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api"
});

apiClient.interceptors.request.use(function (config) {
    const token = getToken();
    if(token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

export default apiClient;
