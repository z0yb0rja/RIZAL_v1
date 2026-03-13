-- SSG RBAC schema (uses existing schools and users tables)

CREATE TABLE IF NOT EXISTS ssg_permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ssg_roles (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    max_members INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ssg_roles_school_role UNIQUE (school_id, role_name)
);

CREATE INDEX IF NOT EXISTS ix_ssg_roles_school_id ON ssg_roles (school_id);

CREATE TABLE IF NOT EXISTS ssg_role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES ssg_roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES ssg_permissions(id) ON DELETE CASCADE,
    CONSTRAINT uq_ssg_role_permission UNIQUE (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS ix_ssg_role_permissions_role_id ON ssg_role_permissions (role_id);
CREATE INDEX IF NOT EXISTS ix_ssg_role_permissions_permission_id ON ssg_role_permissions (permission_id);

CREATE TABLE IF NOT EXISTS ssg_user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES ssg_roles(id) ON DELETE CASCADE,
    school_year VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ssg_user_role_year UNIQUE (user_id, role_id, school_year)
);

CREATE INDEX IF NOT EXISTS ix_ssg_user_roles_user_id ON ssg_user_roles (user_id);
CREATE INDEX IF NOT EXISTS ix_ssg_user_roles_role_id ON ssg_user_roles (role_id);
CREATE INDEX IF NOT EXISTS ix_ssg_user_roles_school_year ON ssg_user_roles (school_year);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ssg_event_status') THEN
        CREATE TYPE ssg_event_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS ssg_events (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status ssg_event_status NOT NULL DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_ssg_events_school_id ON ssg_events (school_id);
CREATE INDEX IF NOT EXISTS ix_ssg_events_status ON ssg_events (status);
CREATE INDEX IF NOT EXISTS ix_ssg_events_event_date ON ssg_events (event_date);

CREATE TABLE IF NOT EXISTS ssg_announcements (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_ssg_announcements_school_id ON ssg_announcements (school_id);
