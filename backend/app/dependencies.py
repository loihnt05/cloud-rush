from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2AuthorizationCodeBearer
from app.core.config import AUTH0_DOMAIN, API_AUDIENCE, ALGORITHMS
from app.core.auth import verify_jwt_token

# OAuth2 scheme for Swagger UI OAuth2 auto-completion
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    tokenUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    authorizationUrl=f"https://{AUTH0_DOMAIN}/authorize",
    refreshUrl=f"https://{AUTH0_DOMAIN}/oauth/token",
    scopes={"openid": "OpenID Connect", "profile": "User profile", "email": "User email"}
)

async def get_auth0_claims(request: Request, token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency to extract and verify Auth0 JWT token claims.
    Uses OAuth2AuthorizationCodeBearer for Swagger UI integration.
    Extracts token from Authorization header for proper validation.
    """
    # Extract token from Authorization header directly
    auth_header = request.headers.get("Authorization", "")
    
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif token:
        # Use the token from oauth2_scheme if no Bearer header
        token = token.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify and decode the token using the centralized function
        payload = verify_jwt_token(token)
        return payload
    except HTTPException:
        # Re-raise HTTPException from verify_jwt_token
        raise
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
