class Next extends Error {}

const createChain = (processors) => {
    const onMessage = async (...args) => {
        const tempMiddlewares = [];

        await processors.reduce(async (next, middleware) => {
            next = await next;
            if (!next) return;
            next = false;
            const nextFunction = (processorOrCommand) => {
                // next = true;
                if (typeof processorOrCommand === 'function') {
                    tempMiddlewares.push(processorOrCommand);
                }
                throw new Next();
            };
            try {
                await middleware(...args, nextFunction);
            } catch (error) {
                return true;
            }
            // return next;
        }, true);

        if (!tempMiddlewares.length) return;
        const tempMiddlewareChain = createChain(...tempMiddlewares);

        await tempMiddlewareChain(...args);
    };

    return onMessage;
};

module.exports = (processors) => createChain(processors);
