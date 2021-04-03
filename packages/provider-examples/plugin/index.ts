import { Module } from '../../../src/types';

const singleton: Record<any, any> = {
    count: 0
};

module.exports = {
    name: 'pure-plugin-proposal',
    // return a instance
    instance (options) {
        singleton.count += 1;
        return {
            count: singleton.count,
            options,
            instanceVariable: 0
        };
    },
    create () {
        return (ctx, next) => {
            console.log(`plugin[${this.count}]`, 'plugin recived message', ctx.message);
        };
    },
    hooks: {
        message (ctx) {
            console.debug(`plugin[${this.count}]`, 'unmanaged onMessage hook recived message', ctx.message);
        }
    }
} as Module.Plugin;
