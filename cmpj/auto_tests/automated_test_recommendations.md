# Automated Test Remarks and Recommendations

## Summary

- Core backend flows are stable. All requests succeeded across multiple runs.
- Tenant isolation is enforced (cross-tenant access denied with `403`).
- Face-scan attendance endpoint is stable at the API level.
- Bulk import preview correctly rejects the invalid sample file (expected behavior).

## Recommendations

1. Password change gate:
   - Detect `code=password_change_required` and route the user to the password change screen.
   - Prevent UI navigation to protected routes until the password change succeeds.
2. Bulk import UX:
   - Surface row-level validation errors returned by the preview endpoint.
   - Explicitly communicate that a file can upload successfully but still be invalid.
3. Permission handling:
   - Treat `403` and `404` distinctly in the UI (do not show a generic crash).
   - For cross-tenant attempts, show a standard “not authorized” or “not found” message depending on policy.
4. Face-scan UI flow:
   - Ensure there is a direct UI path that calls `/attendance/face-scan` and handles success/error states.

## Notes

- These recommendations are based on automated API runs, not UI interaction tests.
- The automated tester creates data and does not clean up.
