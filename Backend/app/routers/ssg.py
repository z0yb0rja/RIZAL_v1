from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user_with_roles, get_school_id_or_403, has_any_role
from app.database import get_db
from app.models.user import User as UserModel
from app.models.ssg import (
    SSGAnnouncement,
    SSGEvent,
    SSGEventStatus,
    SSGPermission,
    SSGRole,
    SSGRolePermission,
    SSGUserRole,
)
from app.schemas.ssg import (
    PermissionCreate,
    PermissionOut,
    RBACMeOut,
    RolePermissionsUpdate,
    SSGAnnouncementCreate,
    SSGAnnouncementOut,
    SSGAssignmentCreate,
    SSGAssignmentOut,
    SSGEventCreate,
    SSGEventUpdate,
    SSGEventOut,
    SSGRoleCreate,
    SSGRoleOut,
    SSGRoleUpdate,
)
from app.services.ssg_rbac import (
    default_school_year,
    get_user_permissions,
    user_has_permission,
    resolve_school_year,
)


router = APIRouter(prefix="/ssg", tags=["ssg"])


def _resolve_school_id(current_user: UserModel, school_id: Optional[int]) -> int:
    if school_id is not None:
        if not has_any_role(current_user, ["admin"]):
            raise HTTPException(status_code=403, detail="Admin privileges required for cross-school access")
        return school_id
    return get_school_id_or_403(current_user)


def _resolve_school_year(request: Request, school_year: Optional[str]) -> str:
    return resolve_school_year(request, school_year)


def _require_school_it(current_user: UserModel) -> None:
    if not has_any_role(current_user, ["school_IT", "school-it", "school_it", "admin"]):
        raise HTTPException(status_code=403, detail="School IT or admin privileges required")


def _role_to_schema(role: SSGRole) -> SSGRoleOut:
    permissions = [PermissionOut.model_validate(link.permission) for link in role.permissions]
    return SSGRoleOut(
        id=role.id,
        school_id=role.school_id,
        role_name=role.role_name,
        max_members=role.max_members,
        created_at=role.created_at,
        permissions=permissions,
    )


def _require_permission(
    db: Session,
    current_user: UserModel,
    school_id: int,
    school_year: str,
    permission_name: str,
) -> None:
    if not user_has_permission(db, current_user.id, school_id, school_year, permission_name):
        raise HTTPException(status_code=403, detail=f"Missing permission: {permission_name}")


@router.get("/permissions", response_model=List[PermissionOut])
def list_permissions(
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    permissions = db.query(SSGPermission).order_by(SSGPermission.permission_name).all()
    return permissions


@router.post("/permissions", response_model=PermissionOut, status_code=status.HTTP_201_CREATED)
def create_permission(
    payload: PermissionCreate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    existing = (
        db.query(SSGPermission)
        .filter(SSGPermission.permission_name == payload.permission_name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Permission already exists")
    permission = SSGPermission(permission_name=payload.permission_name)
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


@router.get("/roles", response_model=List[SSGRoleOut])
def list_roles(
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    scoped_school_id = _resolve_school_id(current_user, school_id)
    roles = (
        db.query(SSGRole)
        .options(joinedload(SSGRole.permissions).joinedload(SSGRolePermission.permission))
        .filter(SSGRole.school_id == scoped_school_id)
        .order_by(SSGRole.role_name)
        .all()
    )
    return [_role_to_schema(role) for role in roles]


@router.post("/roles", response_model=SSGRoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: SSGRoleCreate,
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    scoped_school_id = _resolve_school_id(current_user, school_id)
    existing = (
        db.query(SSGRole)
        .filter(SSGRole.school_id == scoped_school_id, SSGRole.role_name == payload.role_name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Role already exists for this school")
    role = SSGRole(
        school_id=scoped_school_id,
        role_name=payload.role_name,
        max_members=payload.max_members or 1,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return _role_to_schema(role)


@router.patch("/roles/{role_id}", response_model=SSGRoleOut)
def update_role(
    role_id: int,
    payload: SSGRoleUpdate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    role = (
        db.query(SSGRole)
        .options(joinedload(SSGRole.permissions).joinedload(SSGRolePermission.permission))
        .filter(SSGRole.id == role_id)
        .first()
    )
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if payload.role_name is not None:
        role.role_name = payload.role_name
    if payload.max_members is not None:
        role.max_members = payload.max_members
    db.commit()
    db.refresh(role)
    return _role_to_schema(role)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    role = db.query(SSGRole).filter(SSGRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()


@router.put("/roles/{role_id}/permissions", response_model=SSGRoleOut)
def set_role_permissions(
    role_id: int,
    payload: RolePermissionsUpdate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    role = (
        db.query(SSGRole)
        .options(joinedload(SSGRole.permissions).joinedload(SSGRolePermission.permission))
        .filter(SSGRole.id == role_id)
        .first()
    )
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    permission_ids = list(dict.fromkeys(payload.permission_ids))
    if permission_ids:
        permissions = (
            db.query(SSGPermission)
            .filter(SSGPermission.id.in_(permission_ids))
            .all()
        )
        if len(permissions) != len(permission_ids):
            missing = set(permission_ids) - {p.id for p in permissions}
            raise HTTPException(status_code=404, detail=f"Permissions not found: {missing}")

    # Replace permissions atomically to avoid duplicate key violations.
    db.query(SSGRolePermission).filter(SSGRolePermission.role_id == role.id).delete(
        synchronize_session=False
    )
    if permission_ids:
        db.add_all(
            [SSGRolePermission(role_id=role.id, permission_id=pid) for pid in permission_ids]
        )
    db.commit()
    role = (
        db.query(SSGRole)
        .options(joinedload(SSGRole.permissions).joinedload(SSGRolePermission.permission))
        .filter(SSGRole.id == role_id)
        .first()
    )
    return _role_to_schema(role)


@router.post("/assignments", response_model=SSGAssignmentOut, status_code=status.HTTP_201_CREATED)
def assign_role(
    payload: SSGAssignmentCreate,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    role = (
        db.query(SSGRole)
        .options(joinedload(SSGRole.permissions).joinedload(SSGRolePermission.permission))
        .filter(SSGRole.id == payload.role_id)
        .first()
    )
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    user = db.query(UserModel).filter(UserModel.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.school_id != role.school_id:
        raise HTTPException(status_code=400, detail="User and role must belong to the same school")
    existing = (
        db.query(SSGUserRole)
        .filter(
            SSGUserRole.user_id == payload.user_id,
            SSGUserRole.role_id == payload.role_id,
            SSGUserRole.school_year == payload.school_year,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="User already assigned to this role for the school year")
    effective_max_members = role.max_members or 1
    current_count = (
        db.query(SSGUserRole)
        .filter(SSGUserRole.role_id == payload.role_id, SSGUserRole.school_year == payload.school_year)
        .count()
    )
    if current_count >= effective_max_members:
        raise HTTPException(status_code=400, detail="Role member limit reached for the school year")
    assignment = SSGUserRole(
        user_id=payload.user_id,
        role_id=payload.role_id,
        school_year=payload.school_year,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    role_schema = _role_to_schema(role)
    return SSGAssignmentOut(
        id=assignment.id,
        user_id=assignment.user_id,
        role_id=assignment.role_id,
        school_year=assignment.school_year,
        assigned_at=assignment.assigned_at,
        user=user,
        role=role_schema,
    )


@router.get("/assignments", response_model=List[SSGAssignmentOut])
def list_assignments(
    school_year: Optional[str] = Query(default=None),
    role_id: Optional[int] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    scoped_school_id = _resolve_school_id(current_user, school_id)
    query = (
        db.query(SSGUserRole)
        .join(SSGRole)
        .options(
            joinedload(SSGUserRole.user),
            joinedload(SSGUserRole.role).joinedload(SSGRole.permissions).joinedload(SSGRolePermission.permission),
        )
        .filter(SSGRole.school_id == scoped_school_id)
    )
    if school_year:
        query = query.filter(SSGUserRole.school_year == school_year)
    if role_id:
        query = query.filter(SSGUserRole.role_id == role_id)
    if user_id:
        query = query.filter(SSGUserRole.user_id == user_id)
    assignments = query.order_by(SSGUserRole.assigned_at.desc()).all()
    results: List[SSGAssignmentOut] = []
    for assignment in assignments:
        role_schema = _role_to_schema(assignment.role)
        results.append(
            SSGAssignmentOut(
                id=assignment.id,
                user_id=assignment.user_id,
                role_id=assignment.role_id,
                school_year=assignment.school_year,
                assigned_at=assignment.assigned_at,
                user=assignment.user,
                role=role_schema,
            )
        )
    return results


@router.get("/officers", response_model=List[SSGAssignmentOut])
def list_officers(
    school_year: Optional[str] = Query(default=None),
    role_id: Optional[int] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    return list_assignments(
        school_year=school_year,
        role_id=role_id,
        user_id=user_id,
        school_id=school_id,
        current_user=current_user,
        db=db,
    )


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: int,
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    _require_school_it(current_user)
    assignment = db.query(SSGUserRole).filter(SSGUserRole.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()


@router.get("/rbac/me", response_model=RBACMeOut)
def get_my_permissions(
    request: Request,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    permissions = get_user_permissions(db, current_user.id, scoped_school_id, resolved_year)
    role_ids = (
        db.query(SSGUserRole.role_id)
        .join(SSGRole)
        .filter(
            SSGUserRole.user_id == current_user.id,
            SSGUserRole.school_year == resolved_year,
            SSGRole.school_id == scoped_school_id,
        )
        .distinct()
        .all()
    )
    return RBACMeOut(
        school_year=resolved_year,
        permissions=sorted(list(permissions)),
        role_ids=[row[0] for row in role_ids],
    )


@router.post("/events", response_model=SSGEventOut, status_code=status.HTTP_201_CREATED)
def create_ssg_event(
    request: Request,
    payload: SSGEventCreate,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    _require_permission(db, current_user, scoped_school_id, resolved_year, "create_event")
    event = SSGEvent(
        school_id=scoped_school_id,
        title=payload.title,
        description=payload.description,
        event_date=payload.event_date,
        created_by=current_user.id,
        status=SSGEventStatus.PENDING,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=List[SSGEventOut])
def list_ssg_events(
    request: Request,
    status_filter: Optional[SSGEventStatus] = Query(default=None, alias="status"),
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    permissions = get_user_permissions(db, current_user.id, scoped_school_id, resolved_year)
    can_view_all = any(
        permission in permissions
        for permission in ("approve_event", "create_event", "edit_event", "delete_event")
    )
    query = db.query(SSGEvent).filter(SSGEvent.school_id == scoped_school_id)
    if not can_view_all:
        query = query.filter(SSGEvent.status == SSGEventStatus.APPROVED)
    if status_filter and can_view_all:
        query = query.filter(SSGEvent.status == status_filter)
    events = query.order_by(SSGEvent.event_date.desc()).all()
    return events


@router.post("/events/{event_id}/approve", response_model=SSGEventOut)
@router.put("/events/{event_id}/approve", response_model=SSGEventOut)
def approve_ssg_event(
    request: Request,
    event_id: int,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    _require_permission(db, current_user, scoped_school_id, resolved_year, "approve_event")
    event = (
        db.query(SSGEvent)
        .filter(SSGEvent.school_id == scoped_school_id, SSGEvent.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = SSGEventStatus.APPROVED
    event.approved_by = current_user.id
    event.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return event


@router.patch("/events/{event_id}", response_model=SSGEventOut)
def update_ssg_event(
    request: Request,
    event_id: int,
    payload: SSGEventUpdate,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    _require_permission(db, current_user, scoped_school_id, resolved_year, "edit_event")
    event = (
        db.query(SSGEvent)
        .filter(SSGEvent.school_id == scoped_school_id, SSGEvent.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if payload.title is not None:
        event.title = payload.title
    if payload.description is not None:
        event.description = payload.description
    if payload.event_date is not None:
        event.event_date = payload.event_date
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ssg_event(
    request: Request,
    event_id: int,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    _require_permission(db, current_user, scoped_school_id, resolved_year, "delete_event")
    event = (
        db.query(SSGEvent)
        .filter(SSGEvent.school_id == scoped_school_id, SSGEvent.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()


@router.post("/events/{event_id}/reject", response_model=SSGEventOut)
def reject_ssg_event(
    request: Request,
    event_id: int,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    _require_permission(db, current_user, scoped_school_id, resolved_year, "approve_event")
    event = (
        db.query(SSGEvent)
        .filter(SSGEvent.school_id == scoped_school_id, SSGEvent.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = SSGEventStatus.REJECTED
    event.approved_by = current_user.id
    event.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return event


@router.post("/announcements", response_model=SSGAnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    request: Request,
    payload: SSGAnnouncementCreate,
    school_year: Optional[str] = Query(default=None),
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    resolved_year = _resolve_school_year(request, school_year)
    _require_permission(db, current_user, scoped_school_id, resolved_year, "post_announcement")
    announcement = SSGAnnouncement(
        school_id=scoped_school_id,
        title=payload.title,
        message=payload.message,
        created_by=current_user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.get("/announcements", response_model=List[SSGAnnouncementOut])
def list_announcements(
    school_id: Optional[int] = Query(default=None),
    current_user: UserModel = Depends(get_current_user_with_roles),
    db: Session = Depends(get_db),
):
    scoped_school_id = _resolve_school_id(current_user, school_id)
    announcements = (
        db.query(SSGAnnouncement)
        .filter(SSGAnnouncement.school_id == scoped_school_id)
        .order_by(SSGAnnouncement.created_at.desc())
        .all()
    )
    return announcements
