export const createChain = (processors) => async (...args) => {
    const tempMiddlewares = [];

    const lastResult = await processors.reduce(async (next, middleware, index) => {
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
    if (!lastResult) return lastResult;
    if (!tempMiddlewares.length) return lastResult;
    const tempMiddlewareChain = createChain(tempMiddlewares);

    return await tempMiddlewareChain(...args);
};
