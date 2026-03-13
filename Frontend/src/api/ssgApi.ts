import { getAuthToken } from "./authApi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  return { Authorization: `Bearer ${token}` };
};

export type SsgPermission = {
  id: number;
  permission_name: string;
};

export type SsgEvent = {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  status: "pending" | "approved" | "rejected";
  created_by?: number | null;
  approved_by?: number | null;
  created_at: string;
  approved_at?: string | null;
};

export type SsgAnnouncement = {
  id: number;
  title: string;
  message: string;
  created_by?: number | null;
  created_at: string;
};

export const defaultSchoolYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const fetchSsgPermissions = async (schoolYear?: string): Promise<string[]> => {
  const params = new URLSearchParams();
  if (schoolYear) params.set("school_year", schoolYear);
  const response = await fetch(`${BASE_URL}/ssg/rbac/me?${params.toString()}`, {
    headers: {
      ...authHeaders(),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.detail === "string" ? body.detail : "Failed to load permissions");
  }
  return Array.isArray(body.permissions) ? body.permissions : [];
};

export const fetchSsgAnnouncements = async (): Promise<SsgAnnouncement[]> => {
  const response = await fetch(`${BASE_URL}/ssg/announcements`, {
    headers: {
      ...authHeaders(),
    },
  });
  const body = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(typeof body?.detail === "string" ? body.detail : "Failed to load announcements");
  }
  return body as SsgAnnouncement[];
};

export const fetchSsgEvents = async (schoolYear?: string): Promise<SsgEvent[]> => {
  const params = new URLSearchParams();
  if (schoolYear) params.set("school_year", schoolYear);
  const response = await fetch(`${BASE_URL}/ssg/events?${params.toString()}`, {
    headers: {
      ...authHeaders(),
    },
  });
  const body = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(typeof body?.detail === "string" ? body.detail : "Failed to load SSG events");
  }
  return body as SsgEvent[];
};


