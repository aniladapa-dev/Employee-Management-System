import apiClient from "../apiConfig";

const REST_API_BASE_URL = "/reports";

export const downloadEmployeeReport = (deptId, teamId) => {
    let params = [];
    if (deptId) params.push(`departmentId=${deptId}`);
    if (teamId) params.push(`teamId=${teamId}`);
    return apiClient.get(`${REST_API_BASE_URL}/employees` + (params.length ? '?' + params.join('&') : ''), {
        responseType: 'blob'
    });
};

export const downloadAttendanceReport = (month, year, deptId, teamId) => {
    let params = [`month=${month}`, `year=${year}`];
    if (deptId) params.push(`departmentId=${deptId}`);
    if (teamId) params.push(`teamId=${teamId}`);
    return apiClient.get(`${REST_API_BASE_URL}/attendance?` + params.join('&'), {
        responseType: 'blob'
    });
};

export const downloadLeaveReport = (deptId, teamId) => {
    let params = [];
    if (deptId) params.push(`departmentId=${deptId}`);
    if (teamId) params.push(`teamId=${teamId}`);
    return apiClient.get(`${REST_API_BASE_URL}/leaves` + (params.length ? '?' + params.join('&') : ''), {
        responseType: 'blob'
    });
};
