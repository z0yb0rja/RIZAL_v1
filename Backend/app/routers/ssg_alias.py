from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user_with_roles
from app.database import get_db
from app.models.user import User as UserModel
from app.routers import ssg as ssg_router
from app.schemas.ssg import (
    PermissionOut,
    RolePermissionsUpdate,
    SSGAnnouncementCreate,
    SSGAnnouncementOut,
    SSGAssignmentCreate,
    SSGAssignmentOut,
    SSGRoleCreate,
    SSGRoleOut,
    SSGRoleUpdate,
)


router = APIRouter(tags=["ssg-rbac-alias"])


@router.get("/permissions", response_model=List[PermissionOut])
def list_permissions(
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.list_permissions(current_user=current_user, db=db)


@router.get("/roles", response_model=List[SSGRoleOut])
def list_roles(
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.list_roles(
        school_id=school_id,
        current_user=current_user,
        db=db,
    )


@router.post("/roles", response_model=SSGRoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: SSGRoleCreate,
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.create_role(
        payload=payload,
        school_id=school_id,
        current_user=current_user,
        db=db,
    )


@router.put("/roles/{role_id}", response_model=SSGRoleOut)
def update_role(
    role_id: int,
    payload: SSGRoleUpdate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.update_role(
        role_id=role_id,
        payload=payload,
        current_user=current_user,
        db=db,
    )


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.delete_role(
        role_id=role_id,
        current_user=current_user,
        db=db,
    )


@router.post("/roles/{role_id}/permissions", response_model=SSGRoleOut)
def set_role_permissions(
    role_id: int,
    payload: RolePermissionsUpdate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.set_role_permissions(
        role_id=role_id,
        payload=payload,
        current_user=current_user,
        db=db,
    )


@router.post("/assign-role", response_model=SSGAssignmentOut, status_code=status.HTTP_201_CREATED)
def assign_role(
    payload: SSGAssignmentCreate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.assign_role(
        payload=payload,
        current_user=current_user,
        db=db,
    )


@router.get("/announcements", response_model=List[SSGAnnouncementOut])
def list_announcements(
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.list_announcements(
        school_id=school_id,
        current_user=current_user,
        db=db,
    )


@router.post("/announcements", response_model=SSGAnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    request: Request,
    payload: SSGAnnouncementCreate,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return ssg_router.create_announcement(
        request=request,
        payload=payload,
        school_year=school_year,
        school_id=school_id,
        current_user=current_user,
        db=db,
    )
