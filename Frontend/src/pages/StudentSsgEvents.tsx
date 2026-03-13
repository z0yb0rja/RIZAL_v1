import { useEffect, useState } from "react";

import NavbarStudent from "../components/NavbarStudent";
import { defaultSchoolYear, fetchSsgEvents, SsgEvent } from "../api/ssgApi";

const StudentSsgEvents = () => {
  const [events, setEvents] = useState<SsgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSsgEvents(schoolYear);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [schoolYear]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-background, #f5f7faff)" }}>
      <NavbarStudent />
      <main className="container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <div>
            <h2 className="mb-1">SSG Events</h2>
            <p className="text-muted mb-0">Approved SSG events for your school year.</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <label className="form-label mb-0">School Year</label>
            <input
              className="form-control"
              style={{ maxWidth: 160 }}
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive bg-white border rounded shadow-sm">
          <table className="table table-striped table-sm mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">
                    No events available.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{new Date(event.event_date).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-secondary">{event.status}</span>
                    </td>
                    <td>{event.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentSsgEvents;



