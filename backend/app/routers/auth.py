from fastapi import APIRouter, Request, Depends
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from ..core.config import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from ..core.database import get_db
from ..models import User
from pydantic import BaseModel

router = APIRouter(
    tags=["auth"],
    prefix="/auth"
)

class UserCreate(BaseModel):
    name: str
    email: str
    google_id: str = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    google_id: str = None

    class Config:
        from_attributes = True

# Cấu hình OAuth
oAuth = OAuth()
oAuth.register(
    name="google",
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "email openid profile",
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
    },
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
        # Save or update user in database
        google_id = user_info.get('sub')
        email = user_info.get('email')
        name = user_info.get('name')

        # Check if user exists
        db_user = db.query(User).filter(User.google_id == google_id).first()
        if not db_user:
            # Create new user
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
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
