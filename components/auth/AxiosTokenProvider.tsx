"use client";

import { useEffect } from "react";
import apiClient from "@/lib/services/apiClient";

export function AxiosTokenProvider({ token }: { token: string | undefined }) {
  useEffect(() => {
    if (!token) return;

    const requestIntercept = apiClient.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestIntercept);
    };
  }, [token]);

  return null;
}
