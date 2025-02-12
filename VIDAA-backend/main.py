from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from starlette.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from gen_video import gen_video_router
from uploaders import uploaders_router
from dotenv import load_dotenv
import os

load_dotenv()
assert os.path.exists(os.getenv("VIDAA_DB_PATH")), "VIDAA_DB_PATH does not exist"

vidaa = FastAPI()

vidaa.include_router(gen_video_router)
vidaa.include_router(uploaders_router)

vidaa.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@vidaa.middleware("http")
async def add_response_wrapper(request: Request, call_next):
    response = await call_next(request)

    if isinstance(response, JSONResponse):
        return response
    if isinstance(response, Response) and hasattr(response, "body_iterator"):
        return response

    if isinstance(response, FileResponse):
        return response

    body = [chunk async for chunk in response.body_iterator]
    if body:
        try:
            import json

            data = json.loads(b"".join(body))
        except:
            data = body[0].decode() if isinstance(body[0], bytes) else body[0]
    else:
        data = None

    return JSONResponse(
        content={"status_code": response.status_code, "data": data},
        status_code=response.status_code,
    )


@vidaa.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        content={"status_code": exc.status_code, "data": {"detail": exc.detail}},
        status_code=exc.status_code,
    )


@vidaa.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        content={"status_code": 500, "data": {"detail": str(exc)}}, status_code=500
    )
