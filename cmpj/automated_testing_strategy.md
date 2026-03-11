# Automated Testing Strategy: Framework and Scope

This document defines the strategy and functional boundaries for the automated tester implementation.

## 1. Implementation Overview
The testing framework consists of a standalone Python runner (`cmpj/auto_tests/run_tests.py`) designed to simulate user interactions without a graphical interface.

**Operational Workflow:**
1.  **Direct API Access**: Interaction with the backend service running at `http://localhost:8000` via the `httpx` library.
2.  **MFA Bypass (Development)**: Programmatic retrieval of MFA codes directly from the database to facilitate rapid end-to-end testing.
3.  **Cross-Role Validation**: Simulation of distinct user sessions (Admin, Student, SSG) to verify role-based security filters.

## 2. How to Run (Template)
1.  Ensure the backend API is running at `http://localhost:8000`.
2.  Use the runner at `cmpj/auto_tests/run_tests.py`.
3.  Activate a Python environment with the required backend dependencies installed.
4.  Provide admin credentials via environment variables or CLI:
    - `ADMIN_EMAIL` and `ADMIN_PASSWORD`, or `--admin-email` / `--admin-password`.
5.  Run: `python cmpj/auto_tests/run_tests.py --base-url http://localhost:8000`
6.  Results are written to `cmpj/logs_*.psv`.
7.  The runner creates its own test school and accounts per run.

## 3. Security Guardrails
*   MFA bypass must be gated by a configuration flag and disabled by default.
*   Never enable MFA bypass in production environments.
*   Log when the bypass is used in development or test runs.

## 4. Automated Test Coverage
The framework is designed to verify nearly every component of the backend API, including:
*   **Authentication & Access Control**: Passwords, MFA, and JWT security boundaries.
*   **User & Profile Management**: Account creation, profile updates, and biometric registration (using mock data).
*   **School & Tenant Operations**: Creating schools, managing settings, and verifying data isolation between tenants.
*   **Bulk Import Center**: Stress-testing bulk Excel imports with thousands of rows to find performance bottlenecks.
*   **Event & Attendance Logic**: Creating events, scheduling, and verifying attendance records via API.
*   **System Governance**: Audit log accuracy and data retention/cleanup logic.
*   **API Performance**: Measuring latency across all endpoints under high load.

## 5. Testing Limitations
*   **UI/UX Verification**: Automated scripts cannot validate visual layout, design accuracy, or CSS animations.
*   **Biometric Input**: The physical camera scan cannot be automated; the process is verified using mocked facial encoding data.
*   **Cross-Browser Compatibility**: Browser-specific rendering or JavaScript execution issues require manual inspection.
*   **Channel Delivery**: Automated testing verifies the *execution* of notification orders, not the final delivery to external SMS/Email gateways.

## 6. Operational Benefit
The automated tester provides a verification layer that ensures the backend stability before manual UI testing begins. This reduces time spent debugging core system failures during frontend development or UX reviews.
