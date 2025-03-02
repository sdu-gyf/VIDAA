import tempfile
import random
import asyncio
import subprocess
import json
from io import BytesIO

import ffmpeg
import aiohttp

from .test_case import background_image_key_list, ARTICLE
from ..tts import tts_and_get_srt
from utils.vidaa_logger import gen_video_logger


async def get_audio_duration(audio_bytes: bytes) -> float:
    with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as temp_audio_file:
        temp_audio_file.write(audio_bytes)
        temp_audio_file.flush()
        temp_audio_file_path = temp_audio_file.name

        process = subprocess.Popen(
            [
                "ffprobe",
                "-i",
                temp_audio_file_path,
                "-show_entries",
                "format=duration",
                "-print_format",
                "json",
                "-v",
                "error",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        output, error = process.communicate()

        if not output:
            raise ValueError("cannot parse audio duration")

        try:
            json_data = json.loads(output.decode().strip())
            duration = float(json_data["format"].get("duration", 0))
            if duration == 0:
                raise ValueError("audio duration is 0, maybe cannot identify audio")
            return duration
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            raise e


async def pack_video_with_all_resources(
    article: str, background_image_key_list: list[str]
) -> bytes:
    """
    Pack video with all resources
    """
    audio_buffer = BytesIO()
    srt_data = None
    async for chunk in tts_and_get_srt(article, "zh-CN-XiaoxiaoNeural"):
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])
        elif chunk["type"] == "srt":
            srt_data = chunk["data"]
    audio_duration = await get_audio_duration(audio_buffer.getvalue())
    debug_file = open("debug.txt", "w")
    debug_file.write(srt_data)
    debug_file.close()
    img_cnt = int(audio_duration // 5) + 1
    images = background_image_key_list[:img_cnt]
    while len(images) < img_cnt:
        images.append(random.choice(background_image_key_list))

    async with aiohttp.ClientSession() as session:
        tasks = [session.get(url) for url in images]
        responses = await asyncio.gather(*tasks)
        images = [await response.read() for response in responses]

    # ffmpeg connot be async
    with tempfile.NamedTemporaryFile(
        delete=True, suffix=".mp4"
    ) as temp_video_file, tempfile.NamedTemporaryFile(
        delete=True, suffix=".wav"
    ) as temp_audio_file, tempfile.NamedTemporaryFile(
        delete=True, suffix=".srt"
    ) as temp_srt_file, tempfile.NamedTemporaryFile(
        delete=True, suffix=".mp4"
    ) as temp_25fps_video_file, tempfile.NamedTemporaryFile(
        delete=True, suffix=".mp4"
    ) as final_output_file:

        silent_video_process = (
            ffmpeg.input("pipe:", format="image2pipe", framerate=1 / 5)
            .output(temp_video_file.name, vcodec="libx264", pix_fmt="yuv420p")
            .overwrite_output()
            .run_async(pipe_stdin=True, pipe_stderr=True)
        )

        for img in images:
            silent_video_process.stdin.write(img)
        silent_video_process.stdin.close()

        silent_video_process.wait()
        gen_video_logger.info("silent video process done")

        if silent_video_process.returncode != 0:
            raise Exception("silent video process failed")

        temp_audio_file.write(audio_buffer.getvalue())
        temp_audio_file.flush()
        temp_srt_file.write(srt_data.encode("utf-8"))
        temp_srt_file.flush()

        fps_conversion_process = (
            ffmpeg.input(temp_video_file.name)
            .output(temp_25fps_video_file.name, r=25, vf="fps=25")
            .overwrite_output()
            .run_async(pipe_stderr=True)
        )

        stderr = fps_conversion_process.stderr.read()
        fps_conversion_process.wait()
        gen_video_logger.info("fps conversion process done")

        if fps_conversion_process.returncode != 0:
            raise Exception("fps conversion failed")

        temp_25fps_video_file.flush()
        final_video_process = (
            ffmpeg.input(temp_25fps_video_file.name)
            .output(
                final_output_file.name,
                acodec="aac",
                vf=f"subtitles={temp_srt_file.name}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H00000000,Bold=1,Alignment=2'",
            )
            .global_args("-i", temp_audio_file.name)
            .overwrite_output()
            .run_async(pipe_stderr=True)
        )

        stderr = final_video_process.stderr.read()
        final_video_process.wait()
        gen_video_logger.info("final video process done")
        if final_video_process.returncode != 0:
            raise Exception("audio addition failed")

        # Read the final video file into memory
        final_output_file.seek(0)
        video_data = final_output_file.read()

    return video_data


async def pack_video_for_test() -> str:
    import os

    if os.path.exists("output.mp4"):
        os.remove("output.mp4")
    data = await pack_video_with_all_resources(ARTICLE, background_image_key_list)
    with open("output.mp4", "wb") as f:
        f.write(data)
    return "success"
