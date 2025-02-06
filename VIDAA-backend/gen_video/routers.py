from fastapi import APIRouter
from utils.vidaa_logger import gen_video_logger


gen_video_router = APIRouter(prefix="/gen_video", tags=["gen_video"])


@gen_video_router.get("/test")
async def get_gen_video():
    gen_video_logger.info("test gen_video")
    return {"message": "test gen_video"}
