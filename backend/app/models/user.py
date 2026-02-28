from sqlalchemy import Column, String, Boolean, JSON
from app.db.base import Base
from app.models.base import TimestampMixin, SoftDeleteMixin


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Enterprise context
    enterprise_id = Column(String, index=True, nullable=False)
    role = Column(String, default="member")  # admin, member, viewer
    department = Column(String)
    
    # Permissions (RBAC cache)
    permissions = Column(JSON, default=list)
    
    def __repr__(self) -> str:
        return f"<User(email='{self.email}', role='{self.role}')>"