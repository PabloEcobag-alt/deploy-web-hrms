"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mustChangePassword: boolean;
  role: string;
  apps: string[];
  appNames: string[];
  appObjects: any[];
  moduleAccess?: string[];
  permissions?: string[];
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  // Map the NextAuth session user to the legacy User format expected by downstream components
  const user = useMemo(() => {
    if (!session?.user) return null;
    
    return {
      id: session.user.id || "",
      username: session.user.username || "",
      firstName: session.user.firstName || "",
      lastName: session.user.lastName || "",
      email: session.user.email || "",
      mustChangePassword: false, // Fallback
      role: (session as any).role || "Employee",
      apps: [], // Legacy fallback
      appNames: [], // Legacy fallback
      appObjects: [], // Legacy fallback
      moduleAccess: [], // Legacy fallback
      permissions: [] // Legacy fallback
    } as User;
  }, [session]);

  const isLoading = status === "loading";

  const logout = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const updateUser = () => {
    // No-op: User state is now strictly managed by NextAuth
    console.warn("updateUser is deprecated. User state is managed by NextAuth.");
  };

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    logout,
    updateUser
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};