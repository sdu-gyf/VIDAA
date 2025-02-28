import os
import aiohttp
import asyncio
from db import make_async_sqlite_handler
from googletrans import Translator


async def get_image(query: str, num: int = 3, page: int = 1) -> list[str] | None:
    # our translation task is very simple, all are common words
    # so this lightweight local translation library can be used here
    translator = Translator()
    trans = await translator.translate(query, src="auto", dest="en")
    query = trans.text
    async with await make_async_sqlite_handler() as db:
        urls = await db.get_pexels(query, num, page)
        if urls:
            return urls
        url = f"https://api.pexels.com/v1/search?query={query}&per_page={num}&size=small&orientation=square&page={page}"
        headers = {"Authorization": os.environ["VIDAA_PEXELS_API_KEY"]}
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
