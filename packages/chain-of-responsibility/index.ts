// @ts-nocheck
const createChain = (processors) => {
    const onMessage = async (...args) => {
        const tempMiddlewares = [];

        await processors.reduce(async (next, middleware, index) => {
            next = await next;
            if (!next) return;
            next = false;
            const nextFunction = (processorOrCommand) => {
                next = true;
                if (typeof processorOrCommand === 'function') {
                    tempMiddlewares.push(processorOrCommand);
                }
            };
            await middleware(...args, nextFunction);
            return next;
        }, true);

        if (!tempMiddlewares.length) return;
        const tempMiddlewareChain = createChain(tempMiddlewares);

        await tempMiddlewareChain(...args);
    };

    return onMessage;
};

export { createChain };
