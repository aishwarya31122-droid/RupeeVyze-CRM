import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ADMIN_USER = { id: "admin-1", name: "Admin User", role: "admin", email: "admin@rupeevyze.com" };

const ADVISOR_ALLOWED_PATHS = [
  "/adviser/dashboard",
  "/adviser/client-operations",
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dynamicAdvisors, setDynamicAdvisors] = useState([]);

  const login = useCallback((user) => {
    if (user) setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const isAdmin = currentUser?.role === "admin";
  const isAdvisor = currentUser?.role === "advisor";

  const canViewModule = useCallback(
    (modulePath) => {
      if (isAdmin) return true;
      if (isAdvisor) {
        return ADVISOR_ALLOWED_PATHS.some((p) => modulePath.startsWith(p));
      }
      return true;
    },
    [isAdmin, isAdvisor]
  );

  const canEditClient = useCallback(
    (candidate) => {
      if (isAdmin) return true;
      return String(candidate?.assignedAdvisorId || "") === String(currentUser?.id || "");
    },
    [isAdmin, currentUser]
  );

  const canDeleteClient = useCallback(
    (candidate) => {
      if (isAdmin) return true;
      return String(candidate?.assignedAdvisorId || "") === String(currentUser?.id || "");
    },
    [isAdmin, currentUser]
  );

  const canAssignClient = useCallback(() => isAdmin, [isAdmin]);

  const canViewDashboard = useCallback(() => true, []);

  const users = useMemo(() => [ADMIN_USER, ...dynamicAdvisors], [dynamicAdvisors]);

  const value = useMemo(
    () => ({
      currentUser,
      users,
      isAdmin,
      isAdvisor,
      login,
      logout,
      canViewModule,
      canEditClient,
      canDeleteClient,
      canAssignClient,
      canViewDashboard,
      setDynamicAdvisors,
    }),
    [currentUser, users, isAdmin, isAdvisor, login, logout, canViewModule, canEditClient, canDeleteClient, canAssignClient, canViewDashboard, setDynamicAdvisors]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function filterByRole(records, user) {
  if (!user) return [];
  if (user.role === "admin") return records;
  return records.filter((r) => String(r.assignedAdvisorId || "") === String(user.id || ""));
}
