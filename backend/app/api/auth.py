"""POST /auth/login — issues JWT tokens."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.app.core.logging import get_logger
from backend.app.core.security import create_access_token, verify_password
from backend.app.db.models import AuditLog, User
from backend.app.db.session import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from backend.app.core.config import get_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    try:
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.query_params.get("token")
        
        if not token:
            print("Auth error: No token")
            raise HTTPException(status_code=401, detail="Not authenticated")
        settings = get_settings()
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            print("Auth error: user_id is None")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError as e:
        print(f"Auth error: JWTError {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        print("Auth error: user is None")
        raise HTTPException(status_code=401, detail="User not found")
    return user

router = APIRouter(prefix="/auth", tags=["auth"])
log = get_logger(__name__)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    # Deliberately vague to not leak which field is wrong
    user: User | None = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "invalid_credentials", "message": "Invalid email or password"}},
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})

    # Audit log — do NOT log email or password (R10)
    audit = AuditLog(
        user_id=user.id,
        action="login",
        entity="user",
        entity_id=user.id,
        ip=request.client.host if request.client else None,
    )
    db.add(audit)
    db.commit()

    log.info("user_login", extra={"user_id": user.id, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role.value,
        full_name=user.full_name,
    )
