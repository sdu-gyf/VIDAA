from abc import ABC, abstractmethod

class UploaderInterface(ABC):

    @abstractmethod
    def login(self, *args, **kwargs):
        pass

    @abstractmethod
    def upload(self, *args, **kwargs) -> str:
        pass

    @abstractmethod
    def check_login(self) -> bool:
        pass