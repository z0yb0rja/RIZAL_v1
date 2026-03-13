-- Example seed data (adjust school_id/user_id to match your DB)

-- Permissions
INSERT INTO ssg_permissions (permission_name)
VALUES
  ('create_event'),
  ('approve_event'),
  ('post_announcement'),
  ('view_events'),
  ('manage_roles')
ON CONFLICT (permission_name) DO NOTHING;

-- Example roles for school_id = 1
INSERT INTO ssg_roles (school_id, role_name, max_members)
VALUES
  (1, 'President', 1),
  (1, 'Vice President', 1),
  (1, 'Secretary', 2),
  (1, 'Treasurer', 1),
  (1, 'Event Organizer', 5),
  (1, 'Grade Representative', 10)
ON CONFLICT (school_id, role_name) DO NOTHING;

-- Role permissions (map by looking up role_id and permission_id)
INSERT INTO ssg_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM ssg_roles r
JOIN ssg_permissions p ON p.permission_name IN ('approve_event', 'post_announcement')
WHERE r.school_id = 1 AND r.role_name = 'President'
ON CONFLICT DO NOTHING;

INSERT INTO ssg_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM ssg_roles r
JOIN ssg_permissions p ON p.permission_name = 'post_announcement'
WHERE r.school_id = 1 AND r.role_name = 'Vice President'
ON CONFLICT DO NOTHING;

INSERT INTO ssg_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM ssg_roles r
JOIN ssg_permissions p ON p.permission_name = 'create_event'
WHERE r.school_id = 1 AND r.role_name = 'Event Organizer'
ON CONFLICT DO NOTHING;

-- Example assignments for school_year 2025-2026
-- Replace user_id values with actual students
INSERT INTO ssg_user_roles (user_id, role_id, school_year)
SELECT 1001, r.id, '2025-2026'
FROM ssg_roles r
WHERE r.school_id = 1 AND r.role_name = 'President'
ON CONFLICT DO NOTHING;

INSERT INTO ssg_user_roles (user_id, role_id, school_year)
SELECT 1002, r.id, '2025-2026'
FROM ssg_roles r
WHERE r.school_id = 1 AND r.role_name = 'Event Organizer'
ON CONFLICT DO NOTHING;
