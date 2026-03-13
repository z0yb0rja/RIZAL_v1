from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.ssg import SSGEventStatus


class PermissionCreate(BaseModel):
    permission_name: str = Field(..., min_length=3, max_length=100)


class PermissionOut(BaseModel):
    id: int
    permission_name: str

    class Config:
        from_attributes = True


class SSGRoleCreate(BaseModel):
    role_name: str = Field(..., min_length=2, max_length=100)
    max_members: int = Field(default=1, ge=1)


class SSGRoleUpdate(BaseModel):
    role_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    max_members: Optional[int] = Field(default=None, ge=1)


class SSGRoleOut(BaseModel):
    id: int
    school_id: int
    role_name: str
    max_members: Optional[int]
    created_at: datetime
    permissions: List[PermissionOut] = []

    class Config:
        from_attributes = True


class RolePermissionsUpdate(BaseModel):
    permission_ids: List[int]


class UserSummary(BaseModel):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    email: str

    class Config:
        from_attributes = True


class SSGAssignmentCreate(BaseModel):
    user_id: int
    role_id: int
    school_year: str = Field(..., min_length=4, max_length=20)


class SSGAssignmentOut(BaseModel):
    id: int
    user_id: int
    role_id: int
    school_year: str
    assigned_at: datetime
    user: Optional[UserSummary]
    role: Optional[SSGRoleOut]

    class Config:
        from_attributes = True


class RBACMeOut(BaseModel):
    school_year: str
    permissions: List[str]
    role_ids: List[int]


class SSGEventCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: Optional[str] = Field(default=None, max_length=5000)
    event_date: datetime


class SSGEventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=150)
    description: Optional[str] = Field(default=None, max_length=5000)
    event_date: Optional[datetime] = None


class SSGEventOut(BaseModel):
    id: int
    school_id: int
    title: str
    description: Optional[str]
    event_date: datetime
    created_by: Optional[int]
    status: SSGEventStatus
    approved_by: Optional[int]
    created_at: datetime
    approved_at: Optional[datetime]

    class Config:
        from_attributes = True


class SSGAnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    message: str = Field(..., min_length=3, max_length=10000)


class SSGAnnouncementOut(BaseModel):
    id: int
    school_id: int
    title: str
    message: str
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
