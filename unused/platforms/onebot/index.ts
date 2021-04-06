import { Module } from 'types';
import { EventEmitter } from 'events';
import { Context } from 'types/Context';
function split (str, separator, limit) {
    str = str.split(separator);
    if (str.length > limit) {
        const ret = str.splice(0, limit);
        ret.push(str.join(separator));

        return ret;
    }
    return str;
}
const transformCQCode = (segment: Context.Message) => {
    if (typeof segment === 'string') {
        return {
            raw: segment
        };
    }
    if (!segment.CQCode) return segment;

    const [cqCodeType, ...content] = segment.CQCode.slice(3).split(',').map(str => str.trim());
    const obj = {};
    content.forEach(c => {
        const [k, v] = c.split('=');
        obj[k] = v;
    });
    return {
        cqCodeType,
        ...obj
    };
};
const transformMessage = (m: string) => {
    const splitted = m.split('[').reduce((acc, startsWithCQCode, index) => {
        if (index === 0 && !startsWithCQCode.startsWith('CQ:')) {
            acc.push({
                text: '[' + startsWithCQCode.replace('\r', '\n')
            });
            return acc;
        }
        const [cqCode, rest] = split(startsWithCQCode, ']', 1);
        acc.push({
            CQCode: `[${cqCode}]`
        });
        if (rest) {
            acc.push({
                text: rest.replace('\r', '\n')
            });
        }
        return acc;
    }, []);
    return {
        text: m,
        segments: splitted.map(transformCQCode)
    };
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
                source: {
                    sender: {
                        id: '133466799',
                        name: 'arily'
                    }
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
