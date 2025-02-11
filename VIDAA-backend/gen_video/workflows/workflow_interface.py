from abc import ABC, abstractmethod


class WorkflowInterface(ABC):

    @abstractmethod
    def __init__(self, **kwargs):
        pass

    @abstractmethod
    def run(self):
        pass
