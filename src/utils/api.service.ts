import axios, {AxiosInstance, CreateAxiosDefaults} from 'axios';
import LocalStorageService from "./localstorage.service";
import Router from "next/router";
import {Toaster} from "@/components/common";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 120 * 1000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': ' application/json'
    }
} as CreateAxiosDefaults);

axiosInstance.interceptors.request.use((config) => {
        let userSession: any = LocalStorageService.updateUser('get');
        if (config.headers.hasOwnProperty('Skip-Headers')) {
            delete config.headers['Skip-Headers'];
        } else {
            if (!userSession || (!userSession?.token && !userSession?.passwordResetToken)) {
                LocalStorageService.clearStorage();
                Router.push(`/auth/signup`);
                return Promise.reject({error: 'Token not found!'});
            }
            config.headers.Authorization = `Bearer PG ${userSession?.token || userSession?.passwordResetToken}`;
            delete config.headers['Skip-Headers'];
        }
        return config;
    },
    (error) => {
        // Handle request errors here

        return Promise.reject(error);
    });

axiosInstance.interceptors.response.use((response) => {
    return response.data;
}, error => {
    let errorStatus = [401, 403, 500]
    if (error.response && (errorStatus.includes(error.response.status)) && error.response.data) {
        let err = {
            desc: error.response.data.description,
            title: error.response.data.description,
            type: 'error'
        }
        Toaster(err);
        if (error.response.status === 401) {
            Router.push(`/auth/logout`);
            return false;
        }
    } else if (error.code === 'ERR_NETWORK') {
        let err = {
            desc: error.message,
            title: error.message,
            type: 'error'
        }
        Toaster(err);
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

    static callPatch(url: string, payload: any, headers: any = {}) {
        return axiosInstance.patch(url, payload, {
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
