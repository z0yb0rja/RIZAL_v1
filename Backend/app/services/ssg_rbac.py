from datetime import datetime
from typing import Optional, Set

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user_with_roles, get_school_id_or_403
from app.database import get_db
from app.models.user import User as UserModel

from app.models.ssg import (
    SSGPermission,
    SSGRolePermission,
    SSGRole,
    SSGUserRole,
)


def default_school_year(now: Optional[datetime] = None) -> str:
    current = now or datetime.utcnow()
    year = current.year
    if current.month >= 6:
        return f"{year}-{year + 1}"
    return f"{year - 1}-{year}"


def resolve_school_year(request: Request, explicit: Optional[str] = None) -> str:
    if explicit:
        return explicit
    query_value = request.query_params.get("school_year")
    if query_value:
        return query_value
    header_value = request.headers.get("X-School-Year")
    if header_value:
        return header_value
    return default_school_year()


def get_user_permissions(
    db: Session,
    user_id: int,
    school_id: int,
    school_year: str,
) -> Set[str]:
    rows = (
        db.query(SSGPermission.permission_name)
        .join(SSGRolePermission, SSGRolePermission.permission_id == SSGPermission.id)
        .join(SSGRole, SSGRole.id == SSGRolePermission.role_id)
        .join(SSGUserRole, SSGUserRole.role_id == SSGRole.id)
        .filter(
            SSGUserRole.user_id == user_id,
            SSGRole.school_id == school_id,
            SSGUserRole.school_year == school_year,
        )
        .distinct()
        .all()
    )
    return {row[0] for row in rows}


def user_has_permission(
    db: Session,
    user_id: int,
    school_id: int,
    school_year: str,
    permission_name: str,
) -> bool:
    permissions = get_user_permissions(db, user_id, school_id, school_year)
    return permission_name in permissions


def require_ssg_permission(permission_name: str):
    async def _dependency(
        request: Request,
        current_user: UserModel = Depends(get_current_user_with_roles),
        db: Session = Depends(get_db),
    ) -> UserModel:
        school_id = get_school_id_or_403(current_user)
        school_year = resolve_school_year(request)
        if not user_has_permission(db, current_user.id, school_id, school_year, permission_name):
            raise HTTPException(status_code=403, detail=f"Missing permission: {permission_name}")
        return current_user

    return _dependency
