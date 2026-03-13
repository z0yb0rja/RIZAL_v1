import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  fetchSchoolSettings,
  getStoredBranding,
  normalizeLogoUrl,
  SchoolSettings,
} from "../api/schoolSettingsApi";

interface UserContextType {
  avatar: string | null;
  setAvatar: (userId: string, avatar: string) => void;
  branding: SchoolSettings | null;
  setBranding: (branding: SchoolSettings | null) => void;
  refreshBranding: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const clearAuthState = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("userData");
};

const isJwtExpired = (token: string): boolean => {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch {
    return false;
  }
};

const normalizeRoleValues = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return [];
  return roles.filter((role) => typeof role === "string") as string[];
};

const resolveStoredRoles = (): string[] => {
  const raw = localStorage.getItem("userData") || localStorage.getItem("user");
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as { roles?: unknown; role_type?: unknown; role?: unknown };
    const roleSet = new Set<string>();
    normalizeRoleValues(data.roles).forEach((role) => roleSet.add(role));
    if (typeof data.role_type === "string") roleSet.add(data.role_type);
    if (typeof data.role === "string") roleSet.add(data.role);
    return Array.from(roleSet);
  } catch {
    return [];
  }
};

const applyBodyThemeClass = () => {
  const roles = resolveStoredRoles();
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");
  const body = document.body;
  body.classList.remove("theme-admin", "theme-school");
  body.classList.add(isAdmin ? "theme-admin" : "theme-school");
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [branding, setBrandingState] = useState<SchoolSettings | null>(() => {
    const stored = getStoredBranding();
    if (!stored) return null;
    return {
      ...stored,
      logo_url: normalizeLogoUrl(stored.logo_url),
    };
  });

  const setAvatar = (userId: string, newAvatar: string) => {
    localStorage.setItem(`userAvatar_${userId}`, newAvatar);
    setAvatarState(newAvatar);
  };

  const setBranding = (newBranding: SchoolSettings | null) => {
    if (!newBranding) {
      setBrandingState(null);
      return;
    }
    setBrandingState({
      ...newBranding,
      logo_url: normalizeLogoUrl(newBranding.logo_url),
    });
  };

  const refreshBranding = async () => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");
    if (!token) return;
    if (isJwtExpired(token)) {
      clearAuthState();
      return;
    }

    try {
      const live = await fetchSchoolSettings();
      setBranding(live);
    } catch {
      // Branding fetch is best-effort so auth navigation is not blocked.
    }
  };

  useEffect(() => {
    refreshBranding();
  }, []);

  useEffect(() => {
    applyBodyThemeClass();
  }, [branding]);

  useEffect(() => {
    const handleStorage = () => applyBodyThemeClass();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      avatar,
      setAvatar,
      branding,
      setBranding,
      refreshBranding,
    }),
    [avatar, branding]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


