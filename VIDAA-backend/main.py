from fastapi import FastAPI
from gen_video import gen_video_router
from uploaders import uploaders_router

vidaa = FastAPI()

vidaa.include_router(gen_video_router)
vidaa.include_router(uploaders_router)
