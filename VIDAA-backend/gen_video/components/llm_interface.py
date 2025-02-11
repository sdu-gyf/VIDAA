from abc import ABC, abstractmethod
from typing import Optional


class LLMBase(ABC):
    prompt: dict

    @abstractmethod
    def __init__(self, base_url: str, model_name: str, api_key: Optional[str] = None):
        pass

    @abstractmethod
    async def chat(self, chats: list[dict]):
        pass

    def set_system_prompt(self, prompt: str):
        self.prompt = {"role": "system", "content": prompt}

    async def respond(self, message: str):
        response = await self.chat([self.prompt, {"role": "user", "content": message}])
        return response
