# Automated Tester Output Summary

Generated: 2026-03-11 17:52:16
Source logs: cmpj/logs_core_api.psv, cmpj/logs_security.psv, cmpj/logs_bulk_ops.psv, cmpj/logs_biometrics.psv
Time range: 2026-03-11 09:47:55 to 2026-03-11 09:49:22
Runs detected: 3
Run start times:
- 2026-03-11 09:47:55
- 2026-03-11 09:48:26
- 2026-03-11 09:48:59

## Core API
- Total requests: 51
- Success: 51
- Fail: 0
- Error: 0
- Latency (ms): min=71, avg=1248.41, p95=3690, max=3817
- Top 5 slowest calls:
  - SSG_CHANGE_PASSWORD /auth/change-password 3817ms (2026-03-11 09:48:44)
  - SCHOOL_CREATE_WITH_IT /api/school/admin/create-school-it 3781ms (2026-03-11 09:47:59)
  - USER_CREATE_SSG /users/ 3690ms (2026-03-11 09:49:13)
  - SCHOOL_CREATE_WITH_IT_B /api/school/admin/create-school-it 3643ms (2026-03-11 09:48:47)
  - USER_CREATE_SSG /users/ 3586ms (2026-03-11 09:48:10)

## Security
- Checks: 3
- Pass: 3
- Fail: 0
- Actual status distribution: 403: 3

## Bulk Import Preview
- Previews: 3
- Latest preview results:
  - 2026-03-11 09:48:14: rows=2, success=0, failure=2, duration=292ms
  - 2026-03-11 09:48:44: rows=2, success=0, failure=2, duration=28ms
  - 2026-03-11 09:49:18: rows=2, success=0, failure=2, duration=31ms

## Biometrics
- Face-scan checks: 3
- Pass: 3
- Fail: 0

## Notes
- Bulk preview uses e2e_import_invalid.xlsx, so invalid rows are expected.
- This tester creates data in the database and does not clean up.
