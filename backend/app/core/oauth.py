from authlib.integrations.starlette_client import OAuth
from ..core.config import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI

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
