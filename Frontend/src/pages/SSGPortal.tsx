import React, { useEffect, useMemo, useState } from "react";

import { getAuthToken } from "../api/authApi";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Permission = {
  id: number;
  permission_name: string;
};

type Role = {
  id: number;
  school_id: number;
  role_name: string;
  max_members?: number | null;
  created_at: string;
  permissions: Permission[];
};

type UserSummary = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
};

type Assignment = {
  id: number;
  user_id: number;
  role_id: number;
  school_year: string;
  assigned_at: string;
  user?: UserSummary;
  role?: Role;
};

type SSGEvent = {
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

type SSGAnnouncement = {
  id: number;
  title: string;
  message: string;
  created_by?: number | null;
  created_at: string;
};

const defaultSchoolYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const normalizeRole = (role: string) =>
  role.trim().toLowerCase().replace(/_/g, "-");

const permissionLabels: Record<string, string> = {
  post_announcement: "Post Announcement",
  create_event: "Create Event",
  approve_event: "Approve Event",
  edit_event: "Edit Event",
  delete_event: "Delete Event",
};

export const SSGPortal: React.FC = () => {
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear());
  const [myPermissions, setMyPermissions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<UserSummary[]>([]);
  const [events, setEvents] = useState<SSGEvent[]>([]);
  const [announcements, setAnnouncements] = useState<SSGAnnouncement[]>([]);

  const [roleName, setRoleName] = useState("");
  const [roleMaxMembers, setRoleMaxMembers] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    []
  );
  const [roleSelections, setRoleSelections] = useState<Record<number, string>>(
    {}
  );

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  const storedUser = localStorage.getItem("userData") || localStorage.getItem("user");
  const userRoles = useMemo(() => {
    if (!storedUser) return [];
    try {
      const parsed = JSON.parse(storedUser);
      const roles = Array.isArray(parsed.roles) ? parsed.roles : [];
      return roles.map(normalizeRole);
    } catch {
      return [];
    }
  }, [storedUser]);

  const isSchoolIt =
    userRoles.includes("school-it") ||
    userRoles.includes("school_it") ||
    userRoles.includes("admin");

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType("");
    }, 4000);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
      "X-School-Year": schoolYear,
    };
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed: ${response.status}`);
    }
    return response;
  };

  const loadMyPermissions = async () => {
    const response = await fetchWithAuth(
      `${BASE_URL}/ssg/rbac/me?school_year=${encodeURIComponent(schoolYear)}`
    );
    const data = await response.json();
    setMyPermissions(data.permissions || []);
  };

  const loadPermissions = async () => {
    if (!isSchoolIt) return;
    const response = await fetchWithAuth(`${BASE_URL}/ssg/permissions`);
    setPermissions(await response.json());
  };

  const loadRoles = async () => {
    if (!isSchoolIt) return;
    const response = await fetchWithAuth(`${BASE_URL}/ssg/roles`);
    setRoles(await response.json());
  };

  const loadAssignments = async () => {
    if (!isSchoolIt) return;
    const response = await fetchWithAuth(
      `${BASE_URL}/ssg/assignments?school_year=${encodeURIComponent(schoolYear)}`
    );
    setAssignments(await response.json());
  };

  const loadStudents = async () => {
    if (!isSchoolIt) return;
    const response = await fetchWithAuth(`${BASE_URL}/users/by-role/student`);
    setStudents(await response.json());
  };

  const loadEvents = async () => {
    const response = await fetchWithAuth(
      `${BASE_URL}/ssg/events?school_year=${encodeURIComponent(schoolYear)}`
    );
    setEvents(await response.json());
  };

  const loadAnnouncements = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/ssg/announcements`);
    setAnnouncements(await response.json());
  };

  useEffect(() => {
    loadMyPermissions().catch(() => setMyPermissions([]));
    loadPermissions().catch(() => setPermissions([]));
    loadRoles().catch(() => setRoles([]));
    loadAssignments().catch(() => setAssignments([]));
    loadStudents().catch(() => setStudents([]));
    loadEvents().catch(() => setEvents([]));
    loadAnnouncements().catch(() => setAnnouncements([]));
  }, [schoolYear]);

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedPermissionIds([]);
      return;
    }
    const selectedRole = roles.find((role) => role.id === selectedRoleId);
    if (selectedRole) {
      setSelectedPermissionIds(selectedRole.permissions.map((perm) => perm.id));
    }
  }, [selectedRoleId, roles]);

  const resetRoleForm = () => {
    setRoleName("");
    setRoleMaxMembers("");
    setEditingRoleId(null);
  };

  const handleStartEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setRoleName(role.role_name);
    setRoleMaxMembers(role.max_members ? String(role.max_members) : "");
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoleId) {
        await fetchWithAuth(`${BASE_URL}/ssg/roles/${editingRoleId}`, {
          method: "PATCH",
          body: JSON.stringify({
            role_name: roleName,
            max_members: roleMaxMembers ? Number(roleMaxMembers) : 1,
          }),
        });
        showMessage("Role updated", "success");
      } else {
        await fetchWithAuth(`${BASE_URL}/ssg/roles`, {
          method: "POST",
          body: JSON.stringify({
            role_name: roleName,
            max_members: roleMaxMembers ? Number(roleMaxMembers) : 1,
          }),
        });
        showMessage("Role created", "success");
      }
      resetRoleForm();
      await loadRoles();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Failed to save role",
        "error"
      );
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    const confirmed = window.confirm("Delete this role? Existing assignments will be removed.");
    if (!confirmed) return;
    try {
      await fetchWithAuth(`${BASE_URL}/ssg/roles/${roleId}`, { method: "DELETE" });
      showMessage("Role deleted", "success");
      if (editingRoleId === roleId) {
        resetRoleForm();
      }
      await loadRoles();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to delete role", "error");
    }
  };

  const handleUpdateRolePermissions = async () => {
    if (!selectedRoleId) return;
    try {
      await fetchWithAuth(`${BASE_URL}/ssg/roles/${selectedRoleId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permission_ids: selectedPermissionIds }),
      });
      showMessage("Role permissions updated", "success");
      await loadRoles();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to update permissions", "error");
    }
  };

  const handleAssignToRole = async (roleId: number) => {
    const userIdRaw = roleSelections[roleId];
    if (!userIdRaw) return;
    const userId = Number(userIdRaw);
    try {
      await fetchWithAuth(`${BASE_URL}/ssg/assignments`, {
        method: "POST",
        body: JSON.stringify({
          role_id: roleId,
          user_id: userId,
          school_year: schoolYear,
        }),
      });
      showMessage("Student assigned", "success");
      setRoleSelections((prev) => ({ ...prev, [roleId]: "" }));
      await loadAssignments();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Failed to assign student",
        "error"
      );
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await fetchWithAuth(`${BASE_URL}/ssg/assignments/${assignmentId}`, {
        method: "DELETE",
      });
      showMessage("Assignment removed", "success");
      await loadAssignments();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Failed to remove assignment",
        "error"
      );
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`${BASE_URL}/ssg/events?school_year=${encodeURIComponent(schoolYear)}`, {
        method: "POST",
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription || null,
          event_date: eventDate,
        }),
      });
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      showMessage("Event created (pending approval)", "success");
      await loadEvents();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to create event", "error");
    }
  };

  const handleApproveEvent = async (eventId: number) => {
    try {
      await fetchWithAuth(
        `${BASE_URL}/ssg/events/${eventId}/approve?school_year=${encodeURIComponent(schoolYear)}`,
        { method: "POST" }
      );
      showMessage("Event approved", "success");
      await loadEvents();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to approve event", "error");
    }
  };

  const handleRejectEvent = async (eventId: number) => {
    try {
      await fetchWithAuth(
        `${BASE_URL}/ssg/events/${eventId}/reject?school_year=${encodeURIComponent(schoolYear)}`,
        { method: "POST" }
      );
      showMessage("Event rejected", "success");
      await loadEvents();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to reject event", "error");
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`${BASE_URL}/ssg/announcements?school_year=${encodeURIComponent(schoolYear)}`, {
        method: "POST",
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMessage,
        }),
      });
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      showMessage("Announcement posted", "success");
      await loadAnnouncements();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Failed to post announcement",
        "error"
      );
    }
  };

  const assignmentsByRoleId = useMemo(() => {
    const map = new Map<number, Assignment[]>();
    assignments.forEach((assignment) => {
      const list = map.get(assignment.role_id) ?? [];
      list.push(assignment);
      map.set(assignment.role_id, list);
    });
    return map;
  }, [assignments]);

  return (
    <div className="container py-4">
      <h1 className="mb-2">SSG Portal</h1>
      <p className="text-muted">
        School year context drives role assignments and RBAC checks.
      </p>

      <div className="card mb-4">
        <div className="card-body d-flex flex-wrap gap-3 align-items-center">
          <label className="form-label mb-0">School Year</label>
          <input
            className="form-control"
            style={{ maxWidth: "180px" }}
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
          />
          <span className="badge bg-secondary">Permissions: {myPermissions.length}</span>
        </div>
      </div>

      {message && (
        <div className={`alert ${messageType === "success" ? "alert-success" : "alert-danger"}`}>
          {message}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h5>My Permissions</h5>
              {myPermissions.length === 0 ? (
                <p className="text-muted">No SSG permissions assigned.</p>
              ) : (
                <ul className="list-group">
                  {myPermissions.map((perm) => (
                    <li key={perm} className="list-group-item">
                      {permissionLabels[perm] ?? perm}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6" id="ssg-announcements">
          <div className="card h-100">
            <div className="card-body">
              <h5>Announcements</h5>
              {myPermissions.includes("post_announcement") && (
                <form onSubmit={handleCreateAnnouncement} className="mb-3">
                  <input
                    className="form-control mb-2"
                    placeholder="Announcement title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-control mb-2"
                    placeholder="Message"
                    rows={3}
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary" type="submit">
                    Post Announcement
                  </button>
                </form>
              )}
              <div className="list-group">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="list-group-item">
                    <strong>{announcement.title}</strong>
                    <div className="text-muted small">
                      {new Date(announcement.created_at).toLocaleString()}
                    </div>
                    <p className="mb-0">{announcement.message}</p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="text-muted">No announcements yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12" id="ssg-events">
          <div className="card">
            <div className="card-body">
              <h5>Events</h5>
              {myPermissions.includes("create_event") && (
                <form onSubmit={handleCreateEvent} className="row g-2 mb-3">
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Event title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Description"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary" type="submit">
                      Create Event
                    </button>
                  </div>
                </form>
              )}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>{event.title}</td>
                        <td>{new Date(event.event_date).toLocaleString()}</td>
                        <td>
                          <span className="badge bg-secondary">{event.status}</span>
                        </td>
                        <td>
                          {myPermissions.includes("approve_event") && event.status === "pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApproveEvent(event.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRejectEvent(event.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-muted">
                          No events available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {isSchoolIt && (
          <>
            <div className="col-12 col-lg-6" id="ssg-roles">
              <div className="card h-100">
                <div className="card-body">
                  <h5>{editingRoleId ? "Edit SSG Role" : "Create SSG Role Slot"}</h5>
                  <form onSubmit={handleSaveRole} className="row g-2 mb-3">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Role name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Slots (default 1)"
                        value={roleMaxMembers}
                        onChange={(e) => setRoleMaxMembers(e.target.value)}
                        type="number"
                        min={1}
                      />
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-primary w-100" type="submit">
                        {editingRoleId ? "Save" : "Add"}
                      </button>
                    </div>
                    {editingRoleId && (
                      <div className="col-12">
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100"
                          onClick={resetRoleForm}
                        >
                          Cancel Edit
                        </button>
                      </div>
                    )}
                  </form>
                  <p className="text-muted small mb-0">
                    Each role creates a slot box where you can assign students.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-body">
                  <h5>Role Permissions</h5>
                  <div className="mb-2">
                    <select
                      className="form-select"
                      value={selectedRoleId}
                      onChange={(e) =>
                        setSelectedRoleId(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex flex-wrap gap-2">
                      {permissions.map((perm) => (
                        <label key={perm.id} className="badge bg-light text-dark">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={selectedPermissionIds.includes(perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissionIds([...selectedPermissionIds, perm.id]);
                              } else {
                                setSelectedPermissionIds(
                                  selectedPermissionIds.filter((id) => id !== perm.id)
                                );
                              }
                            }}
                          />
                          {permissionLabels[perm.permission_name] ?? perm.permission_name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleUpdateRolePermissions}
                    disabled={!selectedRoleId}
                  >
                    Save Permissions
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5>SSG Role Slots</h5>
                  {roles.length === 0 ? (
                    <div className="text-muted">No roles yet.</div>
                  ) : (
                    <div className="row g-3">
                      {roles.map((role) => {
                        const roleAssignments =
                          assignmentsByRoleId.get(role.id) ?? [];
                        const capacity = role.max_members ?? 1;
                        const isFull = roleAssignments.length >= capacity;
                        return (
                          <div key={role.id} className="col-12 col-md-6 col-xl-4">
                            <div className="card h-100 border">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1">{role.role_name}</h6>
                                    <div className="text-muted small">
                                      Slots: {capacity} · Assigned:{" "}
                                      {roleAssignments.length}
                                    </div>
                                  </div>
                                  <div className="d-flex flex-column align-items-end gap-1">
                                    <span
                                      className={`badge ${
                                        isFull ? "bg-success" : "bg-secondary"
                                      }`}
                                    >
                                      {isFull ? "Full" : "Open"}
                                    </span>
                                    <div className="btn-group btn-group-sm">
                                      <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleStartEditRole(role)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="btn btn-outline-danger"
                                        onClick={() => handleDeleteRole(role.id)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <ul className="list-group mb-3">
                                  {roleAssignments.map((assignment) => {
                                    const name = assignment.user
                                      ? `${assignment.user.first_name ?? ""} ${assignment.user.last_name ?? ""}`.trim() ||
                                        assignment.user.email
                                      : `User #${assignment.user_id}`;
                                    return (
                                      <li
                                        key={assignment.id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                      >
                                        <div>
                                          <div>{name}</div>
                                          {assignment.user?.email && (
                                            <div className="text-muted small">
                                              {assignment.user.email}
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() =>
                                            handleRemoveAssignment(assignment.id)
                                          }
                                        >
                                          Remove
                                        </button>
                                      </li>
                                    );
                                  })}
                                  {roleAssignments.length === 0 && (
                                    <li className="list-group-item text-muted">
                                      No student assigned yet.
                                    </li>
                                  )}
                                </ul>

                                <div className="d-flex gap-2">
                                  <select
                                    className="form-select"
                                    value={roleSelections[role.id] ?? ""}
                                    onChange={(e) =>
                                      setRoleSelections((prev) => ({
                                        ...prev,
                                        [role.id]: e.target.value,
                                      }))
                                    }
                                    disabled={isFull || students.length === 0}
                                  >
                                    <option value="">Select student</option>
                                    {students.map((student) => (
                                      <option key={student.id} value={student.id}>
                                        {student.first_name} {student.last_name} (
                                        {student.email})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => handleAssignToRole(role.id)}
                                    disabled={
                                      isFull || !roleSelections[role.id]?.length
                                    }
                                  >
                                    Assign
                                  </button>
                                </div>

                                {students.length === 0 && (
                                  <div className="text-muted small mt-2">
                                    No students available to assign.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SSGPortal;


