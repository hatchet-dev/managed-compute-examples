import time

from dotenv import load_dotenv

from hatchet_sdk import Context, Hatchet

load_dotenv()

hatchet = Hatchet()

# Default compute


@hatchet.workflow(name="first-workflow")
class ManagedWorkflow:
    @hatchet.step(timeout="11s", retries=3)
    def step1(self, context: Context):
        print("executed step1")
        time.sleep(10)
        # raise Exception("test")
        return {
            "step1": "step1",
        }
    
    @hatchet.step(timeout="11s", retries=3)
    def step2(self, context: Context):
        print("executed step2")
        time.sleep(10)
        return {
            "step2": "step2",
        }

def main():
    workflow = ManagedWorkflow()
    worker = hatchet.worker("test-worker", max_runs=1)
    worker.register_workflow(workflow)
    worker.start()


if __name__ == "__main__":
    main()
