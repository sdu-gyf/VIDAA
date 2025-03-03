import json
import zipfile
from io import BytesIO

from fastapi import APIRouter
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel


from .rss import get_rss_sources, BaseRSSContent
from .workflows.dify import run_workflow
from .images import get_image
from .pack_video.pack_video import pack_video_with_all_resources, pack_video_for_test
from .tts import tts_and_get_srt
from utils.vidaa_logger import gen_video_logger

gen_video_router = APIRouter(prefix="/gen_video", tags=["gen_video"])


@gen_video_router.get("/test")
async def get_gen_video():
    gen_video_logger.info("test gen_video")
    return {"message": "test gen_video"}


@gen_video_router.get("/rss_list")
async def get_supported_rss():
    return get_rss_sources()


@gen_video_router.get("/rss_content")
async def get_rss_content(index: int):
    gen_video_logger.info(f"Starting SSE connection for RSS index: {index}")

    async def content_generator():
        try:
            rss_handler = BaseRSSContent.get_source_by_index(index)
            gen_video_logger.info("RSS handler initialized")

            async for item in rss_handler.get_articles():
                try:
                    detail = await rss_handler.get_article(item)
                    data = {
                        "title": detail.title,
                        "link": detail.link,
                        "content": detail.content,
                    }
                    message = f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
                    yield message
                except Exception as e:
                    gen_video_logger.error(f"Error processing RSS entry: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

            yield f"data: {json.dumps({'type': 'complete'}, ensure_ascii=False)}\n\n"
            gen_video_logger.info("Sent completion signal")

        except Exception as e:
            gen_video_logger.error(f"Error in content generator: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        content_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    )


@gen_video_router.get("/dify")
async def run_dify(url: str):
    async def content_generator():
        async for item in run_workflow(url):
            yield f"data: {json.dumps(item, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'type': 'complete'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        content_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache, no-transform", "Connection": "keep-alive"},
    )


@gen_video_router.get("/images")
async def get_images(query: str, num: int, page: int):
    return await get_image(query, num, page)


@gen_video_router.get("/pack_video_test")
async def pack_video():
    return await pack_video_for_test()


class VideoInfo(BaseModel):
    article: str
    images: list[str]


@gen_video_router.post("/pack_video")
async def pack_video(video_info: VideoInfo):
    data = await pack_video_with_all_resources(video_info.article, video_info.images)
    gen_video_logger.info("pack video done")

    async def content_generator():
        chunk_size = 1024 * 1024  # 1MB
        for i in range(0, len(data), chunk_size):
            yield data[i : i + chunk_size]

    return StreamingResponse(
        content_generator(),
        media_type="video/mp4",
        headers={"Content-Disposition": "attachment; filename=video.mp4"},
    )


class TTSInfo(BaseModel):
    text: str
    voice: str | None = "zh-CN-XiaoxiaoNeural"
    filename: str | None = "tts"


@gen_video_router.post("/tts")
async def tts(tts_info: TTSInfo):
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zip_file:
        audio_buffer = BytesIO()
        async for chunk in tts_and_get_srt(tts_info.text, tts_info.voice):
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])
            elif chunk["type"] == "srt":
                zip_file.writestr(f"{tts_info.filename}.srt", chunk["data"])
        zip_file.writestr(f"{tts_info.filename}.mp3", audio_buffer.getvalue())
    zip_data = zip_buffer.getvalue()

    async def content_generator():
        chunk_size = 1024 * 1024  # 1MB
        for i in range(0, len(zip_data), chunk_size):
            yield zip_data[i : i + chunk_size]

    return StreamingResponse(
        content_generator(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={tts_info.filename}.zip"
        },
    )
