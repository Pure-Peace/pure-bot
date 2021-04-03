import { Module } from '../../../src/types';
import { EventEmitter } from 'events';
export default {
    name: 'pure-provider-myprotocol',
    is: 'provider',
    instance (options) {
        return {
            myConnection: new EventEmitter(),
            options
        };
    },
    provide () {
        setTimeout(() => {
            this.myConnection.emit('message', {
                scope: 'private',
                content: 'hi'
            });
        }, 1000);
        return {
            source: this.myConnection,
            send: (target, message) => console.log('sending message', message, 'to', target)
        };
    }
} as Module.Provider;
