import { useEffect, useState } from "react";

import NavbarStudent from "../components/NavbarStudent";
import { fetchSsgAnnouncements, SsgAnnouncement } from "../api/ssgApi";

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<SsgAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSsgAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-background, #f5f7faff)" }}>
      <NavbarStudent />
      <main className="container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <div>
            <h2 className="mb-1">Announcements</h2>
            <p className="text-muted mb-0">School-wide SSG announcements for your campus.</p>
          </div>
          <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="card">
            <div className="card-body">Loading announcements...</div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card">
            <div className="card-body text-muted">No announcements yet.</div>
          </div>
        ) : (
          <div className="row g-3">
            {announcements.map((item) => (
              <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                    <div className="text-muted small mb-2">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                    <p className="card-text">{item.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAnnouncements;



