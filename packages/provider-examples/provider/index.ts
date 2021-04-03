import { Module } from '../../../src/types';
export default {
    name: 'pure-provider-myprotocol',
    is: 'provider',
    instance (options) {
        return {
            myConnection: {},
            options
        };
    },
    provide () {
        return {
            source: this.myConnection,
            send: (target, message) => this.myConnection.send(target, message)
        };
    }
} as Module.Provider;
