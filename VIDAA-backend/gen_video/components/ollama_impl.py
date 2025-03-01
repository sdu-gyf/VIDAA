from typing import Optional

from ollama import AsyncClient

from .llm_interface import LLMBase


class OllamaImpl(LLMBase):
    client: AsyncClient
    model_name: str
    prompt: dict

    def __init__(self, base_url: str, model_name: str, api_key: Optional[str] = None):
        self.host = base_url
        self.model_name = model_name
        self.client = AsyncClient(
            host=self.host,
        )

    async def chat(self, chats: list[dict]):
        response = await self.client.chat(model=self.model_name, messages=chats)
        return response.message.content


if __name__ == "__main__":
    import asyncio

    async def main():
        ollama_impl = OllamaImpl(
            base_url="http://127.0.0.1:11434", model_name="qwen:4b"
        )
        ollama_impl.set_system_prompt(
            "你只能说“是”或者“不是”，不要回答任何其他多余内容\n"
        )
        response = await ollama_impl.respond("你是qwen吗")
        print(response)

    asyncio.run(main())
