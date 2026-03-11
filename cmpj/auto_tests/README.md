# Automated Tester Actions (run_tests.py)

This document lists the exact user actions simulated by the automated tester.
It uses API calls (not UI clicks) to exercise the same backend flows the UI relies on.

## Action Sequence
1. Admin login (`/token`).
2. Admin creates a school and School IT account (`/api/school/admin/create-school-it`).
3. Admin resets the School IT password (`/api/school/admin/school-it-accounts/{id}/reset-password`).
4. School IT login (`/token`).
5. School IT changes password (`/auth/change-password`) to clear the forced-change gate.
6. School IT creates a department (`/departments/`).
7. School IT creates a program (`/programs/`).
8. School IT creates an event (`/events/`).
9. School IT creates a student user (`/users/`).
10. School IT creates the student profile (`/users/admin/students/`).
11. School IT creates an SSG user (`/users/`).
12. School IT resets the SSG password (`/users/{id}/reset-password`).
13. SSG login (`/token`).
14. SSG changes password (`/auth/change-password`).
15. SSG records face-scan attendance (`/attendance/face-scan`).
16. School IT previews a bulk import file (`/api/admin/import-students/preview`).
17. Admin creates a second school and School IT account (`/api/school/admin/create-school-it`).
18. Second School IT attempts to read a user from the first school (`/users/{id}`) to validate tenant isolation.

## Logs Produced
- `cmpj/logs_core_api.psv`: Every core API call with status/latency.
- `cmpj/logs_security.psv`: Cross-tenant access check result.
- `cmpj/logs_bulk_ops.psv`: Bulk import preview result.
- `cmpj/logs_biometrics.psv`: Face-scan API check result.

## Notes
- The tester creates data in the database (schools, users, events, attendance, logs). It does not clean up.
- It uses admin credentials provided in the CLI or environment variables.
- It does not perform UI interactions, only API calls.
