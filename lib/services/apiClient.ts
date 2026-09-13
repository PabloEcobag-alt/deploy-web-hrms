import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  const token = (session as any)?.accessToken || (session as any)?.user?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (typeof window !== "undefined") {
      if (status === 404) {
        // Graceful handling: notify once and let callers render empty states.
        toast.error("The requested resource was not found.", { id: "http-404" });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
