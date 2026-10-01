import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: "https://dicing-saxophone-food.ngrok-free.dev",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
