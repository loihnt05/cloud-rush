# main.py
from app.routers import pet
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError 
from .config import CLIENT_ID, CLIENT_SECRET


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(SessionMiddleware, secret_key="!secret")
oAuth = OAuth()
oAuth.register(
    name="google",
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "email openid profile",
        "redirect_uri": "http://localhost:8000/auth",
        "response_type": "code",
    },
)

app.include_router(pet.router)

@app.get("/login")
async def login(request: Request):
    url = request.url_for('auth')
    return await oAuth.google.authorize_redirect(request, url)

@app.get('/auth')
async def auth(request: Request):
    try:
        token = await oAuth.google.authorize_access_token(request)
    except OAuthError as e:
        return {"error": str(e)}
    user = token.get('userinfo')
    if user:
        request.session['user'] = dict(user)
    return {"user": user}

@app.get('/me')
async def me(request: Request):
    user = request.session.get('user')
    if user:
        return {"user": user}
    return {"error": "Not logged in"}

@app.get('/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return {"message": "Logged out"}


