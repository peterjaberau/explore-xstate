import { createMachine, fromPromise } from 'xstate'

export const flowMachine = createMachine(
  {
    id: 'flow-machine',
    context: ({ input }) => ({
      applicant: input.applicant
    }),

    meta: {
      title: 'Flow Machine'
    },

    initial: 'CheckApplication',
    states: {
      CheckApplication: {
        on: {
          Submit: [
            {
              target: 'StartApplication',
              guard: 'isOver18',
              reenter: false
            },
            {
              target: 'RejectApplication',
              reenter: false
            }
          ]
        }
      },
      StartApplication: {
        src: 'startApplicationWorkflowId',
        onDone: 'End',
        onError: 'RejectApplication'
      },
      RejectApplication: {
        invoke: {
          src: 'sendRejectionEmailFunction',
          input: ({ context }) => ({
            applicant: context.applicant
          }),
          onDone: 'End'
        }
      },
      End: {
        type: 'final'
      }
    }
  },
  {
    actions: {},
    actors: {
      startApplicationWorkflowId: fromPromise(async () => {
        console.log('startApplicationWorkflowId workflow started')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log('startApplicationWorkflowId workflow completed')
      }),

      sendRejectionEmailFunction: fromPromise(async () => {
        console.log('sendRejectionEmailFunction workflow started')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log('sendRejectionEmailFunction workflow completed')
      })
    },
    guards: {
      isOver18: ({ context }) => context.applicant.age >= 18
    },
    delays: {}
  }
)


// import { assign, setup,  and, or, not } from 'xstate';

export const fetchLogic = fromPromise(async ({ input }: { input: string }) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await response.json();
    return json as Array<{}>;
});
