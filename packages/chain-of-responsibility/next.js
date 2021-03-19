// const middleware1 = (ctx, next) => {
//     console.log('processed at 1', ctx);
//     if (ctx.yes) next();
// };

// const middleware2 = (ctx, next) => {
//     console.log('processed at 2');
// };

const createChain = (...processors) => {
    const onMessage = (...args) => processors.reduce(async (next, middleware) => {
        next = await next;
        if (!next) return;
        next = false;
        const nextFunction = () => { next = true };
        await middleware(...args, nextFunction);
        console.log(next);
        return next;
    }, true);

    return onMessage;
};

module.exports = (...processors) => createChain(...middlewares);

// const middlewares = [middleware1, middleware2];

// const processor = createOnMessage(...middlewares);

// processor({ yes: true });
// processor({});
