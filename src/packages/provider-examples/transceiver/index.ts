import { Module } from 'types';
import { EventEmitter } from 'events';
const transformMessage = (message: string) => {
    return [{
        text: message
    }];
};
export default {
    name: 'pure-transceiver-myprotocol',
    platform: 'test',
    instance (options) {
        return {
            myConnection: new EventEmitter(),
            options
        };
    },
    receiver () {
        setInterval(() => {
            const message = 'hi' + Math.random();
            this.myConnection.emit('event', {
                id: Math.random(),
                scope: 'private',
                type: 'message',
                rawMessage: message,
                message: transformMessage(message),
                sender: {
                    id: '133466799',
                    name: 'arily'
                }
            } as Module.Event);
        }, 1000);
        return {
            source: this.myConnection
        };
    },
    transmitter () {
        return {
            send: (target, message) => console.log('sending message', message, 'to', target)
        };
    },
    features: {}
} as Module.Platform;
