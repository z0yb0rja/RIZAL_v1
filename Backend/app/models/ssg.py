from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class SSGEventStatus(PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class SSGRole(Base):
    __tablename__ = "ssg_roles"
    __table_args__ = (
        UniqueConstraint("school_id", "role_name", name="uq_ssg_roles_school_role"),
        Index("ix_ssg_roles_school_id", "school_id"),
    )

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String(100), nullable=False)
    max_members = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    school = relationship("School")
    permissions = relationship(
        "SSGRolePermission",
        back_populates="role",
        cascade="all, delete-orphan",
    )
    assignments = relationship(
        "SSGUserRole",
        back_populates="role",
        cascade="all, delete-orphan",
    )


class SSGPermission(Base):
    __tablename__ = "ssg_permissions"

    id = Column(Integer, primary_key=True)
    permission_name = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    roles = relationship(
        "SSGRolePermission",
        back_populates="permission",
        cascade="all, delete-orphan",
    )


class SSGRolePermission(Base):
    __tablename__ = "ssg_role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_ssg_role_permission"),
        Index("ix_ssg_role_permissions_role_id", "role_id"),
        Index("ix_ssg_role_permissions_permission_id", "permission_id"),
    )

    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey("ssg_roles.id", ondelete="CASCADE"), nullable=False)
    permission_id = Column(Integer, ForeignKey("ssg_permissions.id", ondelete="CASCADE"), nullable=False)

    role = relationship("SSGRole", back_populates="permissions")
    permission = relationship("SSGPermission", back_populates="roles")


class SSGUserRole(Base):
    __tablename__ = "ssg_user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", "school_year", name="uq_ssg_user_role_year"),
        Index("ix_ssg_user_roles_user_id", "user_id"),
        Index("ix_ssg_user_roles_role_id", "role_id"),
        Index("ix_ssg_user_roles_school_year", "school_year"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("ssg_roles.id", ondelete="CASCADE"), nullable=False)
    school_year = Column(String(20), nullable=False)
    assigned_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User")
    role = relationship("SSGRole", back_populates="assignments")


class SSGEvent(Base):
    __tablename__ = "ssg_events"
    __table_args__ = (
        Index("ix_ssg_events_school_id", "school_id"),
        Index("ix_ssg_events_status", "status"),
        Index("ix_ssg_events_event_date", "event_date"),
    )

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(SSGEventStatus), nullable=False, default=SSGEventStatus.PENDING)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    school = relationship("School")
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])


class SSGAnnouncement(Base):
    __tablename__ = "ssg_announcements"
    __table_args__ = (Index("ix_ssg_announcements_school_id", "school_id"),)

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    school = relationship("School")
    creator = relationship("User", foreign_keys=[created_by])
