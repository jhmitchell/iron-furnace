from pydantic import BaseModel
from typing import Optional

# Pydantic Token Schema
class TokenSchema(BaseModel):
    access_token: str
    token_type: str

# Pydantic Token Data Schema
class TokenData(BaseModel):
    username: Optional[str] = None
