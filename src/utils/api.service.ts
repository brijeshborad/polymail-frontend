import axios, {AxiosInstance, CreateAxiosDefaults} from 'axios';
import LocalStorageService from "./localstorage.service";
import Router from "next/router";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 120 * 1000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': ' application/json'
    },
    // withCredentials: true
} as CreateAxiosDefaults);

axiosInstance.interceptors.request.use((config) => {
    let userSession: any = LocalStorageService.updateUser('get');
    if (config.headers.hasOwnProperty('Skip-Headers')) {
        delete config.headers['Skip-Headers'];
    } else {
        config.headers.Authorization = `Bearer PG ${userSession?.token}`;
        delete config.headers['Skip-Headers'];
    }
    return config;
});

axiosInstance.interceptors.response.use((response) => {
    return response.data;
}, error => {
    if (error.response && error.response.data) {
        if (error.response.data.description === 'Unauthorized') {
            LocalStorageService.clearStorage();
            Router.push(`/auth/login`);
            return false;
        }
    }
    return error
});

class ApiService {
    static callPost(url: string, payload: any, headers: any = {}, options = {}) {
        return axiosInstance.post(url, payload, {
            headers: {
                ...headers
            },
            ...options
        });
    }

    static callGet(url: string, params: any, headers: any = {}) {
        return axiosInstance.get(url, {
            headers: {
                ...headers
            },
            params: params
        });
    }

    static callPut(url: string, payload: any, headers: any = {}) {
        return axiosInstance.put(url, payload, {
            headers: {
                ...headers
            }
        });
    }

    static callDelete(url: string, params: any, headers: any = {}) {
        return axiosInstance.delete(url, {
            headers: {
                ...headers
            },
            params: params
        });
    }
}

export default ApiService;
