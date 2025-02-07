from abc import ABC, abstractmethod


class LLMBase(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def authorize(self, *args, **kwargs):
        pass

    @abstractmethod
    async def chat(self, prompt: str):
        pass


class BaseAgent(ABC):

    @abstractmethod
    def __init__(self, model: LLMBase, prompt: str):
        pass

    @abstractmethod
    async def respond(self, message: str):
        pass
