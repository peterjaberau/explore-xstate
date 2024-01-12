import { createMachine, fromPromise } from 'xstate'


const DataTableMachine = createMachine(
    {
        id: "DataTableMachine",
        initial: "idle",
        context: ({ input }) => ({
            selected: input.selected,
            logTransition: true,
        }),
        meta: {
            title: 'Data Table Machine'
        },


        // These actions can be performed in any state
        on: {
            // Toast actions forward these events to the toast machine
            // TOAST: { actions: forwardTo(toaster) },
            // UNTOAST: { actions: forwardTo(toaster) },
        },
        states: {
            idle: {
                on: {
                    INIT: {
                        actions: "initialize",
                        target: "loading",
                    },
                },
            },

            ready: {
                on: {
                    SELECT: {
                        actions: "select",
                    },

                    DESELECT: {
                        actions: "deselect",
                    },

                    CONFIGURE: [
                        {
                            guard: "pageConfig",
                            actions: "setPage",
                            target: "loading",
                        },
                        {
                            guard: "limitConfig",
                            actions: "setLimit",
                            target: "loading",
                        },
                    ],

                    LOAD: {
                        target: "loading",
                    },

                    ADD: {
                        target: "adding",
                    },

                    EDIT: {
                        target: "editing",
                    },

                    DELETE: {
                        target: "deleting",
                    },
                },
            },

            loading: {
                invoke: {
                    id: "load",
                    src: "loadStore",
                    onDone: "ready",
                    onError: "ready",
                },
            },

            adding: {
                invoke: {
                    id: "create",
                    src: CreateMachine,
                    data: {
                        store: (ctx) => ctx.store,
                    },
                    onDone: "ready",
                    onError: "ready",
                },
            },

            editing: {
                entry: assign({
                    selected: (_, evt) => [evt.item],
                }),
                invoke: {
                    id: "update",
                    src: UpdateMachine,
                    data: {
                        store: (ctx) => ctx.store,
                        item: (_, evt) => evt.item,
                    },
                    onDone: "ready",
                    onError: "ready",
                },
            },

            deleting: {
                entry: assign({
                    selected: (_, evt) => [evt.item],
                }),
                invoke: {
                    id: "delete",
                    src: DeleteMachine,
                    data: {
                        store: (ctx) => ctx.store,
                        item: (_, evt) => evt.item,
                    },
                    onDone: "ready",
                    onError: "ready",
                },
            },
        },
    },
    {
        actions: {
            initialize: assign({
                store: (_, evt) => evt.store,
            }),
            setPage: (ctx, evt) => {
                ctx.store.setStart((evt.page - 1) * ctx.store.limit);
            },
            select: assign({
                selected: (_, evt) => [evt.item],
            }),
            deselect: assign({
                selected: [],
            }),
        },
        services: {
            loadStore: (ctx) => ctx.store.load,
        },
        guards: {
            pageConfig: (_, evt) => Object.prototype.hasOwnProperty.call(evt, "page"),
            limitConfig: (_, evt) =>
                Object.prototype.hasOwnProperty.call(evt, "limit"),
        },
    }
);
