from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuthError

from ..core.database import get_db
from ..models.user_model import User
from ..schemas.user_schema import UserCreate, UserResponse
from ..core.oauth import oAuth

router = APIRouter(
    tags=["auth"],
)

@router.get("/login")
async def login(request: Request):
    url = request.url_for('auth')
    return await oAuth.google.authorize_redirect(request, url)


@router.get("/auth/callback", name="auth")
async def auth(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oAuth.google.authorize_access_token(request)
    except OAuthError as e:
        return {"error": str(e)}
    user_info = token.get('userinfo')
    if user_info:
        google_id = user_info.get('sub')
        email = user_info.get('email')
        name = user_info.get('name')

        db_user = db.query(User).filter(User.google_id == google_id).first()
        if not db_user:
            db_user = db.query(User).filter(User.email == email).first()
            if db_user:
                if db_user.google_id is None:
                    db_user.google_id = google_id
                    db.commit()
                    db.refresh(db_user)
                elif db_user.google_id != google_id:
                    return {"error": "Email already associated with different Google account"}
            else:
                db_user = User(
                    google_id=google_id,
                    email=email,
                    name=name
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)

        request.session['user'] = dict(user_info)
        request.session['user_id'] = db_user.id
    return {"user": user_info}


@router.get("/me")
async def me(request: Request):
    user = request.session.get('user')
    if user:
        return {"user": user}
    return {"error": "Not logged in"}


@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
