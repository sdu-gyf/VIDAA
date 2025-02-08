from typing import AsyncGenerator, Dict, Any, Type, List, Tuple
from abc import ABC, abstractmethod
from feedparser import parse
import aiohttp
import requests
from bs4 import BeautifulSoup


def rss_source(url: str, name: str):
    """Decorator to register RSS sources and names."""

    def wrapper(cls):
        cls.rss_url = url
        cls.rss_name = name
        BaseRSSContent.register_source(name, cls)
        return cls

    return wrapper


class Entry:
    title: str
    summary: str
    link: str
    content: str

    def __init__(self, title: str, summary: str, link: str):
        self.title = title
        self.summary = summary
        self.link = link

    def __str__(self):
        return f"{self.title}: {self.link}"

    def set_content(self, content: str):
        self.content = content


class BaseRSSContent(ABC):
    _sources: Dict[str, Type["BaseRSSContent"]] = {}
    rss_url: str
    rss_name: str

    def __init__(self):
        pass

    @classmethod
    def register_source(cls, name: str, source_cls: Type["BaseRSSContent"]):
        cls._sources[name] = source_cls

    @classmethod
    def get_source_by_name(cls, name: str) -> Type["BaseRSSContent"]:
        if name not in cls._sources:
            raise ValueError(f"Unregistered RSS source: {name}")
        return cls._sources[name]()

    @classmethod
    def get_source_by_index(cls, index: int) -> Type["BaseRSSContent"]:
        """Get the RSS source class by index."""
        unique_sources = list(cls._sources.keys())
        return cls.get_source_by_name(unique_sources[index])

    @classmethod
    def get_all_sources(cls) -> List[Tuple[int, str, str]]:
        """Get all registered RSS sources and their names, returning a numbered list."""
        unique_sources = {
            name: cls._sources[name] for name in cls._sources if name in cls._sources
        }
        return [
            (index + 1, name, unique_sources[name].rss_url)
            for index, name in enumerate(unique_sources.keys())
        ]

    async def get_entries(self) -> AsyncGenerator[Entry, None]:
        feed = parse(self.rss_url)
        for entry in feed.entries:
            res = Entry(
                title=entry.title,
                summary=entry.summary,
                link=entry.link,
            )
            yield res

    @abstractmethod
    async def get_detail(self, entry: Entry) -> Dict[str, Any]:
        pass

    def __str__(self):
        return f"{self.rss_name}: {self.rss_url}"


@rss_source("https://plink.anyfeeder.com/nytimes/dual", "人民网-时政")
class PeoplePoliticsContent(BaseRSSContent):
    async def get_detail(self, entry: Entry) -> Entry:
        request_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
        }
        # FIXME: aiohttp will timeout
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(entry.link, headers=request_headers) as response:
        #         soup = BeautifulSoup(await response.text(), 'html.parser')
        #         res = soup.find_all('div', class_='article-paragraph')
        #         res = res[1::2]
        response = requests.get(entry.link, headers=request_headers)
        soup = BeautifulSoup(response.text, "html.parser")
        res = soup.find_all("div", class_="article-paragraph")
        res = "\n".join(p.text for p in res[1::2])
        entry.set_content(res)
        return entry


def get_rss_sources():
    return [
        {"index": it[0] - 1, "name": it[1], "url": it[2]}
        for it in BaseRSSContent.get_all_sources()
    ]


if __name__ == "__main__":
    import asyncio

    async def main():
        sources = BaseRSSContent.get_all_sources()
        for index, name, url in sources:
            print(f"{index}. {name}: {url}")

        index = 0
        rss_handler = BaseRSSContent.get_source_by_index(index)
        print(rss_handler)

        async for item in rss_handler.get_entries():
            detail = await rss_handler.get_detail(item)
            print(detail.content)

    asyncio.run(main())
