from typing import Optional

from openai import AsyncOpenAI

from .llm_interface import LLMBase


class OpenAIImpl(LLMBase):
    client: AsyncOpenAI
    model_name: str

    def __init__(self, base_url: str, model_name: str, api_key: Optional[str] = None):
        self.host = base_url
        self.model_name = model_name
        assert api_key is not None, "api_key is required when using openai style llm"
        self.client = AsyncOpenAI(base_url=self.host, api_key=api_key)

    async def chat(self, chats: list[dict]):
        response = await self.client.chat.completions.create(
            model=self.model_name, messages=chats
        )
        return response.choices[0].message.content


if __name__ == "__main__":
    import asyncio
    import os

    async def main():
        base_url = os.getenv("OPENAI_BASE_URL")
        model_name = os.getenv("OPENAI_MODEL_NAME")
        api_key = os.getenv("OPENAI_API_KEY")
        openai_impl = OpenAIImpl(
            base_url=base_url, model_name=model_name, api_key=api_key
        )
        openai_impl.set_system_prompt(
            "你只能说“是”或者“不是”，不要回答任何其他多余内容\n"
        )
        response = await openai_impl.respond("你是GPT吗")
        print(response)

    asyncio.run(main())
