from llm_interface import LLMBase, BaseAgent

from ollama import AsyncClient
from typing import Optional


class OllamaImpl(LLMBase):
    client: AsyncClient
    model_name: str

    def __init__(self, base_url: str, model_name: str, api_key: Optional[str] = None):
        self.host = base_url
        self.model_name = model_name
        self.client = AsyncClient(
            host=self.host,
        )

    async def chat(self, chats: list[dict]):
        response = await self.client.chat(model=self.model_name, messages=chats)
        return response.message.content


class OllamaAgent(BaseAgent):
    def __init__(self, model: OllamaImpl, prompt: str):
        self.model = model
        self.prompt = {"role": "system", "content": prompt}

    async def respond(self, message: str):
        response = await self.model.chat(
            [self.prompt, {"role": "user", "content": message}]
        )
        return response


if __name__ == "__main__":
    import asyncio

    async def main():
        ollama_impl = OllamaImpl(
            base_url="http://127.0.0.1:11434", model_name="qwen:4b"
        )
        ollama_agent = OllamaAgent(
            ollama_impl, "你只能说“是”或者“不是”，不要回答任何其他多余内容\n"
        )
        response = await ollama_agent.respond("你是qwen吗")
        print(response)

    asyncio.run(main())
