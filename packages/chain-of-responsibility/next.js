const createChain = require('./index');

const middleware1 = (ctx, next) => {
    console.log('processed at 1', ctx);
    if (ctx.nextFrom1) next();
};

const middleware2 = (ctx, next) => {
    console.log('processed at 2');
    if (ctx.tempMiddleware) {
        return next((ctx, next) => {
            console.log('processed at 2, temp middleware');
            next(() => {
                console.log('processed at 2, temp middleware, temp middleware');
            });
        });
    } else return next();
};

const middleware3 = (ctx, next) => {
    console.log('processed at 3');
};

const middlewares = [middleware1, middleware2, middleware3];

const processor = createChain(...middlewares);

(async () => {
    await processor({ nextFrom1: true });
    await processor({ tempMiddleware: true, nextFrom1: true });
    await processor({});
})();
