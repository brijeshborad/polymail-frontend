import axios, {AxiosInstance, CreateAxiosDefaults} from 'axios';
import {getStoreLocal, setStoreLocal} from "./localstorage.service";
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
    let userSession: any = getStoreLocal('ploy-user');
    if (config.headers.hasOwnProperty('Skip-Headers')) {
        delete config.headers['Skip-Headers'];
    } else {
        config.headers.Authorization = `Bearer ${userSession.accessToken}`;
        delete config.headers['Skip-Headers'];
    }
    return config;
});

axiosInstance.interceptors.response.use((response) => {
    if (response.data) {
        if (response.data.message === 'Unauthorized') {
            let session = {
                authenticated: false,
                user: {
                    role: "visitor"
                },
                accessToken: ""
            };
            setStoreLocal('ploy-user', session);
            Router.push(`/auth/login`);
        }
    }
    return response.data;
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
