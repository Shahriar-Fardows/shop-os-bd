"use client";

import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    withCredentials: true, // Important for handle cookies like refreshToken
});

// Add a request interceptor to add the auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized access
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only force-logout on 401 (token missing / expired / invalid).
    // 403 means the user IS authenticated but lacks permission for a specific
    // action — logging them out would be wrong (e.g. a role check failure on
    // one endpoint should not kill the whole session).
    // Requests can also opt-out by passing { _skipLogout: true } in their config.
    const is401 = error.response?.status === 401;
    const skipLogout = error.config?._skipLogout;

    if (is401 && !skipLogout && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default function useAxios() {
    return axiosInstance;
}
