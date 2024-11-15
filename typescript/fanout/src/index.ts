import Hatchet, { Workflow } from "@hatchet-dev/typescript-sdk";
import { ManagedWorkerRegion } from "@hatchet-dev/typescript-sdk/clients/rest/generated/cloud/data-contracts";
import { GPUCompute, SharedCPUCompute } from "@hatchet-dev/typescript-sdk/clients/worker/compute/compute-config";

const hatchet = Hatchet.init();

const oneCpuWorkerConfig: SharedCPUCompute = {
  cpuKind: 'shared',
  memoryMb: 1024,
  numReplicas: 3,
  cpus: 1,
  regions: [ManagedWorkerRegion.Ewr],
};

type Input = {
  input: string;
};

type Output = {
  'child-work': {
    'child-output': string;
  };
};

const parentWorkflow: Workflow = {
  id: 'parent-workflow',
  description: 'simple example for spawning child workflows',
  on: {
    event: 'fanout:create',
  },
  steps: [
    {
      name: 'parent-spawn',
      timeout: '70s',
      compute: oneCpuWorkerConfig,
      run: async (ctx) => {
        const promises = Array.from({ length: 3 }, (_, i) =>
          ctx
            .spawnWorkflow<Input, Output>(
              'child-workflow',
              { input: `child-input-${i}` },
              { additionalMetadata: { childKey: 'childValue' } }
            )
            .result()
            .then((result) => {
              ctx.log(`spawned workflow result: ${JSON.stringify(result)}`);
              return result;
            })
        );

        ctx.releaseSlot();

        const results = await Promise.all(promises);
        console.log('spawned workflow results:', results);
        console.log('number of spawned workflows:', results.length);
        return { spawned: 'x' };
      },
    },
  ],
};

const longString = Array.from({ length: 100_000 }, (_, i) => `item-${i}`).join(',');
console.log('Long string preview:', longString.slice(0, 100));

const childWorkflow: Workflow = {
  id: 'child-workflow',
  description: 'simple example for spawning child workflows',
  on: {
    event: 'child:create',
  },
  steps: [
    {
      name: 'child-work',
      compute: oneCpuWorkerConfig,
      run: async (ctx) => {
        const { input } = ctx.workflowInput();
        ctx.log(longString);
        return { 'child-output': 'sm' };
      },
    },
  ],
};

async function main() {
  const worker = await hatchet.worker('fanout-worker', { maxRuns: 1000 });
  await worker.registerWorkflow(parentWorkflow);
  await worker.registerWorkflow(childWorkflow);
  worker.start();
}

main();