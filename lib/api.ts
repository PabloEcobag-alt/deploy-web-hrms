import axios from "axios";
import { toast } from "sonner";
// import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api-hrms-prod-dcfne2c0baa4cgd5.australiaeast-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Global interceptor for kill-switch functionality
let authContext: any = null;

export const setAuthContext = (context: any) => {
  authContext = context;
};

api.interceptors.request.use(async (config) => {
  // const session = await getSession();
  // const token = (session as any)?.accessToken || (session as any)?.user?.accessToken;
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // AUTH BYPASS: forced logout/redirect on 401/403 commented out so failed
    // API calls don't kick you back to /signin while previewing the UI.
    // if (status === 401 || status === 403) {
    //   // Kill-switch: Force logout and redirect
    //   if (authContext?.logout) {
    //     try {
    //       await authContext.logout();
    //     } catch (logoutError) {
    //       // Ensure logout happens even if API call fails
    //       console.error('Logout API failed:', logoutError);
    //     }
    //   }
    //
    //   // Clear any remaining session data
    //   if (typeof window !== 'undefined') {
    //     localStorage.clear();
    //     sessionStorage.clear();
    //
    //     // Force redirect to signin
    //     const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? 'http://localhost:3000';
    //     window.location.href = `${hostUrl}/signin`;
    //   }
    // }

    if (status === 404 && typeof window !== 'undefined') {
      // Graceful handling: notify once, then let the caller handle the rejection.
      toast.error('The requested resource was not found.', { id: 'http-404' });
    }

    return Promise.reject(error);
  }
);

export default api;