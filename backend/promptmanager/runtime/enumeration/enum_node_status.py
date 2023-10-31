from enum import Enum

from promptmanager.runtime.enumeration.enum_flow_status import PMFlowStatus


class PMNodeStatus(Enum):
    QUEUED = 'queued'
    RUNNING = 'running'
    SUCCESS = 'success'
    FAILED = 'failed'
