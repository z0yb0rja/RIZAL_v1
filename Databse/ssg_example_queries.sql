-- List all SSG roles for a school
SELECT * FROM ssg_roles WHERE school_id = 1 ORDER BY role_name;

-- List permissions for a role
SELECT p.permission_name
FROM ssg_role_permissions rp
JOIN ssg_permissions p ON p.id = rp.permission_id
WHERE rp.role_id = 10;

-- Assign a student to a role (guarded by max_members in API)
INSERT INTO ssg_user_roles (user_id, role_id, school_year)
VALUES (1005, 10, '2025-2026');

-- Count members in a role for a school year
SELECT COUNT(*) AS member_count
FROM ssg_user_roles
WHERE role_id = 10 AND school_year = '2025-2026';

-- List SSG officers for a school and year
SELECT u.id, u.first_name, u.last_name, r.role_name, ur.school_year
FROM ssg_user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN ssg_roles r ON r.id = ur.role_id
WHERE r.school_id = 1 AND ur.school_year = '2025-2026'
ORDER BY r.role_name, u.last_name;

-- Create a pending event
INSERT INTO ssg_events (school_id, title, description, event_date, created_by)
VALUES (1, 'Intramurals', 'Sports event', '2026-08-01 09:00:00', 1002);

-- Approve an event
UPDATE ssg_events
SET status = 'approved',
    approved_by = 1001,
    approved_at = NOW()
WHERE id = 55 AND school_id = 1;

-- Student view of approved events
SELECT * FROM ssg_events WHERE school_id = 1 AND status = 'approved' ORDER BY event_date DESC;

-- Create announcement
INSERT INTO ssg_announcements (school_id, title, message, created_by)
VALUES (1, 'Meeting Reminder', 'SSG meeting on Friday 3pm.', 1001);

-- View announcements
SELECT * FROM ssg_announcements WHERE school_id = 1 ORDER BY created_at DESC;
