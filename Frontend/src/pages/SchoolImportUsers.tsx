import { useEffect, useRef, useState } from "react";
import { FaDownload, FaFileExcel, FaUpload } from "react-icons/fa";

import NavbarSchoolIT from "../components/NavbarSchoolIT";
import {
  downloadImportErrors,
  downloadUserImportTemplate,
  getImportStatus,
  importUsersFromExcel,
  ImportPreviewSummary,
  previewImportUsersFromExcel,
  retryFailedImportRows,
  UserImportSummary,
} from "../api/schoolSettingsApi";

const POLL_INTERVAL_MS = 1500;

const SchoolImportUsers = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [downloadingErrors, setDownloadingErrors] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<UserImportSummary | null>(null);
  const [preview, setPreview] = useState<ImportPreviewSummary | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const showOverlay = loading || previewing || retrying;
  const overlayTitle = previewing
    ? "Previewing file..."
    : retrying
    ? "Retrying failed rows..."
    : "Import in progress...";
  const progressPercent =
    summary && summary.total_rows > 0 ? summary.percentage_completed : 0;

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (queuedJobId: string) => {
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      try {
        const status = await getImportStatus(queuedJobId);
        setSummary(status);
        if (status.state === "completed" || status.state === "failed") {
          stopPolling();
          setLoading(false);
        }
      } catch (err) {
        stopPolling();
        setLoading(false);
        setError(err instanceof Error ? err.message : "Failed to poll import status.");
      }
    }, POLL_INTERVAL_MS);
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError(null);
    try {
      await downloadUserImportTemplate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download template.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (loading) return;
    if (!selectedFile) {
      setError("Please select an Excel (.xlsx) file first.");
      return;
    }
    if (!preview) {
      setError("Preview the file first before importing.");
      return;
    }
    if (!preview.can_commit) {
      setError("Fix preview errors before importing.");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const job = await importUsersFromExcel(selectedFile);
      setJobId(job.job_id);
      startPolling(job.job_id);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to import users.");
    }
  };

  const handlePreview = async () => {
    if (previewing || loading) return;
    if (!selectedFile) {
      setError("Please select an Excel (.xlsx) file first.");
      return;
    }

    setPreviewing(true);
    setError(null);
    setPreview(null);
    setSummary(null);

    try {
      const result = await previewImportUsersFromExcel(selectedFile);
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview file.");
    } finally {
      setPreviewing(false);
    }
  };

  const handleDownloadErrors = async () => {
    if (!jobId) return;

    setDownloadingErrors(true);
    setError(null);
    try {
      await downloadImportErrors(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download failed rows report.");
    } finally {
      setDownloadingErrors(false);
    }
  };

  const handleRetryFailedRows = async () => {
    if (!jobId) return;
    if (retrying || loading) return;
    setRetrying(true);
    setError(null);
    try {
      const job = await retryFailedImportRows(jobId);
      setJobId(job.job_id);
      setSummary(null);
      setPreview(null);
      startPolling(job.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry failed rows.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-background, #f5f7faff)" }}>
      {showOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 20, 35, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="card shadow-lg border-0"
            style={{
              width: "min(520px, 92vw)",
              background: "var(--card-background, #ffffff)",
              color: "var(--text-color, #0f172a)",
            }}
          >
            <div className="card-body text-center">
              <div className="spinner-border text-primary mb-3" role="status" />
              <h5 className="mb-2">{overlayTitle}</h5>
              <p className="text-muted mb-3">
                {summary
                  ? `Processed ${summary.processed_rows} of ${summary.total_rows} rows.`
                  : "Please keep this tab open while we process the file."}
              </p>
              <div className="progress mb-2" style={{ height: "8px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: "var(--primary-color, #162F65ff)",
                  }}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <small className="text-muted">
                {summary ? `${progressPercent.toFixed(1)}% complete` : "Initializing..."}
              </small>
            </div>
          </div>
        </div>
      )}
      <NavbarSchoolIT />

      <main className="container py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h3 className="mb-2">Import Students via Excel</h3>
            <p className="text-muted">
              Upload your student sheet. `School_ID` is not required because students are always imported into your own
              school automatically.
            </p>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                className="btn btn-outline-secondary"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
              >
                <FaDownload className="me-2" />
                {downloadingTemplate ? "Downloading..." : "Download Template"}
              </button>

              <label className="btn btn-outline-primary mb-0">
                <FaFileExcel className="me-2" />
                {selectedFile ? selectedFile.name : "Choose .xlsx File"}
                <input
                  type="file"
                  accept=".xlsx"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                    setPreview(null);
                    setSummary(null);
                    setError(null);
                  }}
                />
              </label>

              <button className="btn btn-outline-primary" onClick={handlePreview} disabled={previewing || loading}>
                {previewing ? "Previewing..." : "Preview File"}
              </button>

              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={loading || previewing || retrying}
                style={{
                  backgroundColor: "var(--primary-color, #162F65ff)",
                  borderColor: "var(--primary-color, #162F65ff)",
                }}
              >
                <FaUpload className="me-2" />
                {loading ? "Processing..." : "Import Students"}
              </button>
            </div>

            {preview && (
              <div className="mt-3">
                <div className={`alert ${preview.can_commit ? "alert-success" : "alert-warning"}`}>
                  <strong>Preview:</strong> {preview.valid_rows} valid, {preview.invalid_rows} invalid (total{" "}
                  {preview.total_rows}).
                  {!preview.can_commit && " Please fix invalid rows before importing."}
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Status</th>
                        <th>Errors</th>
                        <th>Suggestions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 30).map((row) => (
                        <tr key={`${row.row}-${row.status}`}>
                          <td>{row.row}</td>
                          <td>{row.status}</td>
                          <td>{row.errors.join("; ") || "-"}</td>
                          <td>{row.suggestions.join(" | ") || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}

            {summary && (
              <div className="mt-3">
                <div className="alert alert-info" role="alert">
                  <strong>Job State:</strong> {summary.state} <br />
                  <strong>Progress:</strong> {summary.processed_rows}/{summary.total_rows} ({summary.percentage_completed}%)
                  <br />
                  <strong>Result:</strong> {summary.success_count} success, {summary.failed_count} failed
                </div>
                {summary.state === "completed" && summary.failed_count === 0 && (
                  <div className="alert alert-success" role="alert">
                    All user accounts were created successfully.
                  </div>
                )}
                {summary.state === "completed" && summary.failed_count > 0 && (
                  <div className="alert alert-warning" role="alert">
                    Import completed with some failures. Download the failed rows or retry them.
                  </div>
                )}

                {summary.failed_count > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Row Errors</h6>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleDownloadErrors}
                        disabled={downloadingErrors || !jobId}
                      >
                        {downloadingErrors ? "Downloading..." : "Download Failed Rows"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleRetryFailedRows}
                        disabled={retrying || !jobId}
                      >
                        {retrying ? "Retrying..." : "Retry Failed Rows"}
                      </button>
                    </div>
                  </div>
                )}

                {summary.errors.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.errors.map((row) => (
                          <tr key={`${row.row}-${row.error}`}>
                            <td>{row.row}</td>
                            <td>{row.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolImportUsers;



