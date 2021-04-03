import { Module } from '../../../src/types';

const singleton: Record<any, any> = {
    count: 0
};

module.exports = {
    name: 'pure-plugin-proposal',
    // return a instance
    instance (options) {
        return {
            options,
            instanceVariable: 0
        };
    },
    create () {
        singleton.count += 1;
        console.log('installed plugin, count=', singleton.count);
        this.count = singleton.count;
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
