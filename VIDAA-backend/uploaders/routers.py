from fastapi import APIRouter
from utils.vidaa_logger import uploaders_logger


uploaders_router = APIRouter(prefix="/uploaders", tags=["uploaders"])


@uploaders_router.get("/test")
async def get_uploaders():
    uploaders_logger.info("test uploaders")
    return {"message": "test uploaders"}
