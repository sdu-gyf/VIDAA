import os
import aiohttp
from db import make_async_sqlite_handler


async def get_image(query: str, num: int = 3, page: int = 1) -> list[str] | None:
    async with await make_async_sqlite_handler() as db:
        urls = await db.get_pexels(query, num, page)
        if urls:
            return urls
        url = f"https://api.pexels.com/v1/search?query={query}&per_page={num}&size=small&orientation=square&page={page}"
        headers = {"Authorization": os.environ["VIDAA_PEXELS_API_KEY"]}
        print(url)
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                photos = await response.json()
                urls = [photo["src"]["original"] for photo in photos["photos"]]
                await db.insert_pexels(query, ",".join(urls), page, num)
                return urls


if __name__ == "__main__":
    import asyncio

    async def main():
        data = await get_image("cat")
        import pprint

        pprint.pprint(data)

    asyncio.run(main())
