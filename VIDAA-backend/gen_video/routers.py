from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from utils.vidaa_logger import gen_video_logger
import json
from .rss import get_rss_sources, BaseRSSContent

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

            async for item in rss_handler.get_entries():
                try:
                    detail = await rss_handler.get_detail(item)
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
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
    )
