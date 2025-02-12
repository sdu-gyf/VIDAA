import aiosqlite
import os


class AsyncSQLiteHandler:
    def __init__(self, db_file: str):
        assert os.path.exists(db_file), f"Database file {db_file} does not exist"
        self.db_file = db_file

    async def __aenter__(self):
        self.conn = await aiosqlite.connect(self.db_file)
        self.cursor = await self.conn.cursor()
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        await self.conn.close()

    async def execute(self, sql: str, params: tuple = ()):
        await self.cursor.execute(sql, params)
        await self.conn.commit()

    async def insert_ollama_config(self, model_name: str, base_url: str):
        await self.execute(
            "INSERT INTO ollama_config (model_name, base_url) VALUES (?, ?)",
            (model_name, base_url),
        )

    async def get_ollama_configs(self):
        await self.execute(
            "SELECT model_name, base_url FROM ollama_config where is_valid = 1"
        )
        return [
            {"model_name": i[0], "base_url": i[1]} for i in await self.cursor.fetchall()
        ]

    async def insert_article(
        self, title: str, url: str, from_rss_name: str, content: str
    ):
        await self.execute(
            "INSERT INTO article (title, url, from_rss_name, content) VALUES (?, ?, ?, ?)",
            (title, url, from_rss_name, content),
        )

    async def get_articles(self, url: str):
        await self.execute(
            "SELECT title, url, from_rss_name, content FROM article WHERE url = ?",
            (url,),
        )
        result = await self.cursor.fetchall()
        return result[0] if result else None


async def make_async_sqlite_handler():
    return AsyncSQLiteHandler(os.getenv("VIDAA_DB_PATH"))


if __name__ == "__main__":

    async def make_async_sqlite_handler():
        return AsyncSQLiteHandler("/workspace/VIDAA/VIDAA-backend/db/vidaa.db")

    import asyncio

    async def main():
        async with await make_async_sqlite_handler() as db:
            await db.insert_ollama_config("qwen:4b", "http://127.0.0.1:11434")
            configs = await db.get_ollama_configs()
            print(configs)

    asyncio.run(main())
