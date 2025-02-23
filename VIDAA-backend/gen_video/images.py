import os
import aiohttp


async def get_image(query: str, num: int = 3, page: int = 1):
    url = f"https://api.pexels.com/v1/search?query={query}&per_page={num}&size=small&orientation=square&page={page}"
    headers = {"Authorization": os.environ["VIDAA_PEXELS_API_KEY"]}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            photos = await response.json()
            return [photo["src"]["original"] for photo in photos["photos"]]


if __name__ == "__main__":
    import asyncio

    async def main():
        data = await get_image("cat")
        import pprint

        pprint.pprint(data)

    asyncio.run(main())
