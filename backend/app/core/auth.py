from app.core.config import API_AUDIENCE, AUTH0_DOMAIN, ALGORITHMS
from fastapi_auth0 import Auth0
from fastapi import HTTPException, status
from jose import jwt, JWTError
import requests

# Create Auth0 instance that can handle ID tokens  
auth0 = Auth0(
    domain=AUTH0_DOMAIN, 
    api_audience=API_AUDIENCE,
    auto_error=True
)

def verify_jwt_token(token: str) -> dict:
    """
    Verify and decode a JWT token from Auth0.
    Returns the decoded payload (claims) if valid.
    Raises HTTPException if invalid.
    """
    try:
        # Get the signing key from Auth0
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks = requests.get(jwks_url, timeout=10).json()
        
        # Decode the token header to get the key ID
        unverified_header = jwt.get_unverified_header(token)
        
        # Check if kid exists in header
        if "kid" not in unverified_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token header missing 'kid'. Header: {unverified_header}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Find the right key
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unable to find key with kid '{unverified_header['kid']}' in JWKS",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        # Re-raise HTTPExceptions from above
        raise
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token missing required field: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )