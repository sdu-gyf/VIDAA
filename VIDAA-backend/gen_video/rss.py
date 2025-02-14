from typing import AsyncGenerator, Dict, Any, Type, List, Tuple, Optional
from abc import ABC, abstractmethod
from feedparser import parse
import aiohttp
from bs4 import BeautifulSoup
from db import make_async_sqlite_handler


def rss_source(url: str, name: str):
    """Decorator to register RSS sources and names."""

    def wrapper(cls):
        cls.rss_url = url
        cls.rss_name = name
        BaseRSSContent.register_source(name, cls)
        return cls

    return wrapper


class Article:
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
    request_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }
    _session: Optional[aiohttp.ClientSession] = None

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

    @abstractmethod
    async def get_articles(self) -> AsyncGenerator[Article, None]:
        pass

    @abstractmethod
    async def parse_content(self, content: str) -> str:
        pass

    async def get_article(self, article: Article) -> Article:
        async with await make_async_sqlite_handler() as db:
            stored_article = await db.get_articles(article.link)
            if stored_article:
                article.set_content(stored_article[3])
                return article
            session = await self.get_session()
            async with session.get(
                article.link, headers=self.request_headers
            ) as response:
                content = await response.text()
                res = await self.parse_content(content)
                article.set_content(res)
                await db.insert_article(article.title, article.link, self.rss_name, res)
                return article

    def __str__(self):
        return f"{self.rss_name}: {self.rss_url}"

    @classmethod
    async def get_session(cls) -> aiohttp.ClientSession:
        if cls._session is None:
            cls._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers=cls.request_headers,
                connector=aiohttp.TCPConnector(force_close=True, ssl=False, limit=10),
                trust_env=True,
            )
        return cls._session

    async def close(self):
        if self._session is not None:
            await self._session.close()
            self._session = None


@rss_source("https://plink.anyfeeder.com/nytimes/dual", "纽约时报双语版")
class NYTimesContent(BaseRSSContent):

    async def get_articles(self) -> AsyncGenerator[Article, None]:
        feed = parse(self.rss_url)
        for entry in feed.entries:
            article = Article(
                title=entry.title,
                summary=entry.summary,
                link=entry.link,
            )
            yield article

    async def parse_content(self, content: str) -> str:
        soup = BeautifulSoup(content, "html.parser")
        res = "\n".join(
            p.text for p in soup.find_all("div", class_="article-paragraph")[1::2]
        )
        return res


@rss_source("https://plink.anyfeeder.com/chinadaily/china", "中国日报: 时政")
class ChinaDailyPolitics(BaseRSSContent):

    async def get_articles(self) -> AsyncGenerator[Article, None]:
        feed = parse(self.rss_url)
        for entry in feed.entries:
            article = Article(
                title=entry.title,
                summary=entry.summary,
                link=entry.link,
            )
            yield article

    async def parse_content(self, content: str) -> str:
        soup = BeautifulSoup(content, "html.parser")
        res = "\n".join(p.text for p in soup.find_all("p")).replace("关闭", "")
        return res


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

        articles = []
        async for item in rss_handler.get_articles():
            articles.append(item)

        # Modified to properly handle async gathering
        details = await asyncio.gather(
            *(rss_handler.get_article(article) for article in articles)
        )

        for detail in details:
            print(detail.content)

    asyncio.run(main())
