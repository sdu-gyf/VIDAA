import os
import aiohttp
import json
from typing import AsyncGenerator


def str_convert(s: str) -> str:
    assert s in ["node_started", "node_finished"]
    if s == "node_started":
        return "running"
    else:
        return "completed"


async def run_workflow(url: str) -> AsyncGenerator[dict, None]:
    headers = {
        "Authorization": f"Bearer {os.environ['VIDAA_DIFY_API_KEY']}",
        "Content-Type": "application/json",
    }
    async with aiohttp.ClientSession(
        timeout=aiohttp.ClientTimeout(total=900),
        headers=headers,
        connector=aiohttp.TCPConnector(force_close=True, ssl=False, limit=10),
        trust_env=True,
    ) as session:
        async with session.post(
            f"{os.environ['VIDAA_DIFY_URL']}/workflows/run",
            json={
                "inputs": {"input": url},
                "response_mode": "streaming",
                "user": "vidaa-backend",
            },
        ) as response:
            async for line in response.content:
                line = line.decode("utf-8").strip()
                if line.startswith("data:"):
                    json_data = json.loads(line[5:])
                    title = json_data["data"].get("title", None)
                    if title:
                        status = str_convert(json_data["event"])
                        data = {"title": title, "status": status}
                        yield data
                    if json_data["event"] == "workflow_finished":
                        data = {
                            "status": json_data["data"]["status"],
                            "outputs": json_data["data"]["outputs"],
                            "error": json_data["data"]["error"],
                        }
                        yield data
                    if json_data.get("__is_success", 1) == 0:
                        data = {
                            "status": "failed",
                            "error": json_data["__error"],
                        }
                        yield data


if __name__ == "__main__":
    import asyncio

    asyncio.run(
        run_workflow(
            "https://cn.nytimes.com/usa/20250212/elon-musk-companies-conflicts/dual"
        )
    )
