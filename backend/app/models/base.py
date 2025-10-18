from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

metadata = MetaData()

class Base(DeclarativeBase):
    metadata = metadata
