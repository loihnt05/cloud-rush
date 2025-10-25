import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests

from app.dependencies import verify_jwt, get_mgmt_token
from app.core.database import get_db
from app.core.config import AUTH0_DOMAIN, ROLE_ID_MAP
from app.models.role_request import RoleRequest
from app.routers.role_request_router import RoleRequestSchema, get_current_user

router = APIRouter(tags=["authentication"])

@router.get("/auth")
def auth_required(payload: dict = Depends(verify_jwt)):
    """Verify JWT token and return user information"""
    return {"user": payload}

@router.get("/admin/role-requests")
def get_role_requests(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all role requests"""
    requests_data = db.query(RoleRequest).order_by(RoleRequest.created_at.desc()).all()
    return {
        "requests": [
            {
                "id": req.id,
                "user_id": req.user_id,
                "requested_role": req.requested_role,
                "approved": req.approved,
                "created_at": req.created_at.isoformat() if req.created_at else None
            }
            for req in requests_data
        ]
    }

@router.post("/admin/approve-role/{request_id}")
def approve_role(
    request_id: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Approve a role request and grant the role to the user"""
    req = db.query(RoleRequest).filter(RoleRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    token = get_mgmt_token()
    role_id = ROLE_ID_MAP[req.requested_role]

    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{req.user_id}/roles"
    res = requests.post(url, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }, json={"roles": [role_id]})

    if res.status_code != 204:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    req.approved = True
    db.commit()
    return {"message": "Role granted successfully!"}

@router.post("/role-request")
def request_role(
    data: RoleRequestSchema,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Submit a new role request"""
    new_req = RoleRequest(id=str(uuid.uuid4()), user_id=user_id, requested_role=data.requested_role)
    db.add(new_req)
    db.commit()
    return {"message": "Request submitted!"}
