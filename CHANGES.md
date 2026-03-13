# CHANGES

## Overview
Implemented multi-school SSG RBAC using the existing `ssg_*` data model and APIs to avoid breaking the global roles/events system. Added migration-backed tables, default permissions, permission helper updates, UI updates for School IT management, and student-facing announcements/events views.

## Database Changes
- Added Alembic migration: `e7b1c2d3f4ab_add_ssg_rbac_tables.py`.
- Creates the `ssg_*` RBAC and workflow tables and seeds default permissions.
- Defines `ssg_event_status` enum (`pending`, `approved`, `rejected`).

## New Tables
- `ssg_permissions`
- `ssg_roles`
- `ssg_role_permissions`
- `ssg_user_roles`
- `ssg_events`
- `ssg_announcements`

## Permission Engine
- Extended `app/services/ssg_rbac.py` with:
  - `resolve_school_year(request, explicit)`
  - `require_ssg_permission(permission_name)` dependency helper
- Existing `user_has_permission` remains the core reusable check.

## SSG Role Management
- School IT can create/edit/delete roles, assign permissions, and assign students via the SSG Portal.
- Role permission checkboxes now show human-friendly labels.
- Role editing and deletion added to the role slot cards.

## Student Dashboard Feature Logic
- Student dashboard now:
  - Always shows SSG Announcements and SSG Events cards.
  - Adds permission-driven cards (`post_announcement`, `create_event`, `approve_event`) when available.

## API Endpoints Added/Updated
- SSG RBAC migration-backed endpoints already under `/ssg`.
- Added alias endpoints (non-conflicting):
  - `GET /permissions`
  - `GET /roles`
  - `POST /roles`
  - `PUT /roles/{id}`
  - `DELETE /roles/{id}`
  - `POST /roles/{id}/permissions`
  - `POST /assign-role`
  - `GET /announcements`
  - `POST /announcements`
- SSG Events:
  - `PUT /ssg/events/{id}/approve` (alias to existing POST)
  - `PATCH /ssg/events/{id}` (requires `edit_event`)
  - `DELETE /ssg/events/{id}` (requires `delete_event`)

Note: `/events` is already used by the main event system and is not overridden. SSG events remain under `/ssg/events` to avoid breaking existing functionality.

## UI Changes
- School IT navbar now includes a collapsible sidebar with links:
  - Dashboard, Students, SSG Role Management, Announcements, Events
- Added student-facing pages:
  - `StudentAnnouncements` (SSG announcements)
  - `StudentSsgEvents` (approved SSG events)
- Student sidebar updated with Announcements and SSG Events links.

## Compatibility Notes
- No changes to existing global role system or main `/events` endpoints.
- SSG RBAC operates alongside current role-based access checks without breaking legacy flows.
