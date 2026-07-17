import { Client } from '@stomp/stompjs';
import { getToken } from './auth/AuthService';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const wsUrl = apiBaseUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws');

let stompClient = null;
let currentToken = null;
let connectionCallbacks = [];

export const getWebSocketClient = () => {
    const token = getToken();
    
    if (stompClient && currentToken !== token) {
        disconnectWebSocket();
    }

    if (stompClient) return stompClient;

    currentToken = token;
    stompClient = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
            Authorization: `Bearer ${token}`
        },
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
    });

    stompClient.onConnect = (frame) => {
        console.log('Connected to WebSocket broker: ' + frame);
        connectionCallbacks.forEach(callback => callback(stompClient));
    };

    stompClient.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };

    stompClient.activate();
    return stompClient;
};

export const onWebSocketConnect = (callback) => {
    connectionCallbacks.push(callback);
    if (stompClient && stompClient.connected) {
        callback(stompClient);
    }
    return () => {
        connectionCallbacks = connectionCallbacks.filter(c => c !== callback);
    };
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        currentToken = null;
        connectionCallbacks = [];
    }
};
