import time

from dotenv import load_dotenv

from hatchet_sdk import Context, Hatchet
from hatchet_sdk.compute.configs import Compute

load_dotenv()

hatchet = Hatchet()

# Default compute

default_compute = Compute(cpu_kind="shared", cpus=1, memory_mb=1024, regions=["ewr"])

@hatchet.workflow(on_events=["user:create"])
class ManagedWorkflow:
    @hatchet.step(timeout="11s", retries=3, compute=default_compute)
    def step1(self, context: Context):
        print("executed step1")
        time.sleep(10)
        # raise Exception("test")
        return {
            "step1": "step1",
        }

def main():
    workflow = ManagedWorkflow()
    worker = hatchet.worker("test-worker", max_runs=1)
    worker.register_workflow(workflow)
    worker.start()


if __name__ == "__main__":
    main()
