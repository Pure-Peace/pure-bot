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
        setInterval(() => {
            this.myConnection.emit('message', {
                scope: 'private',
                rawMessage: 'hi',
                sender: {
                    id: '133466799',
                    name: 'arily'
                }
            });
        }, 1000);
        return {
            source: this.myConnection,
            send: (target, message) => console.log('sending message', message, 'to', target)
        };
    }
} as Module.Provider;
