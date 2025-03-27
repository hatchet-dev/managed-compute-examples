import Hatchet from "@hatchet-dev/typescript-sdk";

const hatchet = Hatchet.init();

const firstWorkflow = hatchet.workflow({
  name: 'first-workflow',
})

const firstWorkflowStep = firstWorkflow.task({
  name: 'first-workflow-step',
  fn: async (ctx) => {
    console.log('executed first-workflow-step!');
    return { firstWorkflowStep: 'first-workflow-step results!' };
  },
});

firstWorkflow.task({
  name: 'second-workflow-step',
  parents: [firstWorkflowStep],
  fn: async (ctx) => {
    console.log('executed second-workflow-step!');
    return { secondWorkflowStep: 'second-workflow-step results!' };
  },
});

async function main() {
  const worker = await hatchet.worker('managed-worker', {
    workflows: [firstWorkflow],
  });
  await worker.start();
}

main();
