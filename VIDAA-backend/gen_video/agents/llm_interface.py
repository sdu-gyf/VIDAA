from abc import ABC, abstractmethod
from typing import Optional


class LLMBase(ABC):
    @abstractmethod
    def __init__(self, base_url: str, model_name: str, api_key: Optional[str] = None):
        pass

    @abstractmethod
    async def chat(self, chats: list[dict]):
        pass


class BaseAgent(ABC):
    @abstractmethod
    def __init__(self, model: LLMBase, prompt: str):
        pass

    @abstractmethod
    async def respond(self, message: str):
        pass
