from llm_interface import LLMBase, BaseAgent

from ollama import AsyncClient


class OllamaImpl(LLMBase):

    client: AsyncClient
    model_name: str
    host: str

    def __init__(self):
        pass

    def authorize(self, *args, **kwargs):
        self.host = kwargs["base_url"]
        self.model_name = kwargs["model_name"]
        self.client = AsyncClient(
            host=self.host,
        )

    async def chat(self, prompt: str):
        response = await self.client.chat(
            model=self.model_name, messages=[{"role": "user", "content": prompt}]
        )
        return response.message.content


class OllamaAgent(BaseAgent):

    def __init__(self, model: OllamaImpl, prompt: str):
        self.model = model
        self.prompt = prompt

    async def respond(self, message: str):
        a = self.prompt + message
        print(a)
        response = await self.model.chat(self.prompt + message)
        return response


if __name__ == "__main__":
    import asyncio

    async def main():
        ollama_impl = OllamaImpl()
        ollama_impl.authorize(base_url="http://127.0.0.1:11434", model_name="qwen:4b")
        ollama_agent = OllamaAgent(
            ollama_impl, "你只能说“是”或者“不是”，不要回答任何其他多余内容\n"
        )
        response = await ollama_agent.respond("你是qwen吗")
        print(response)

    asyncio.run(main())
