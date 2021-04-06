// @ts-nocheck
import { Module, Context } from 'types';

const EventEmitter = require('events');
const irc = require('irc');
const pEvent = require('p-event');
const transformSegment = (segment: Context.Message) => {
    if (typeof segment === 'string') return segment;
    const messages = [];
    if (segment.notify) messages.push(segment.notify.id);
    if (segment.quote) { console.log('todo: messageId') }; // todo messageId
    if (segment.text) messages.push(segment.text);
    // if (segment.image) messages.push(segment.image) // todo: file server
    return messages.join('');
};
export default {
    name: 'pure-platform-irc',
    platform: 'irc',
    instance (options) {
        return {
            ...options,
            options,
            client: new irc.Client(options.host, options.nickname, {
                ...options,
                userName: options.username
            }),
            event: new EventEmitter()
        };
    },
    async receiver (bot) {
        // const getChannel = async (channelId) => {
        //     return await getChannelList().find((channel) => channel.name === channelId);
        // };
        const getChannelList = async () => {
            if (this.list) return this.list;
            this.client.list();
            const list = await pEvent(this.client, 'channellist', { timeout: this.timeout || 10 * 1000 });
            this.list = list.map((channel) => ({
                channelId: channel.name,
                channelName: channel.name,
                topic: channel.topic
            }));
            return list;
        };
        const logger = console;
        this.client.connect();
        this.client.addListener('error', function (message) {
            logger.error('error: ', message);
        });
        const data = await pEvent(this.client, 'registered', { timeout: this.timeout || 10 * 1000 }).catch(error => {
            console.log(error);
        });
        if (!data) throw new Error('error when logging in');

        logger.log('logged in', data);

        const channels = await getChannelList();
        console.table(channels);
        channels.map((channel) => this.client.join(channel.channelId, () => logger.log('joined', channel.channelId)));
        logger.log('joined all channels');
        this.client.on('message', (nick, to, text, message) => {
            // logger.log('received message', { nick, to, text });
            const data = {
                id: [nick, to, Math.random()],
                type: 'message',
                timestamp: new Date(),
                scope: to.startsWith('#') ? 'channel' : 'private',
                message: {
                    text,
                    notify: text.includes(this.options.nickname),
                    segments: [{
                        text
                    }]
                } as Context.Message,
                sender: {
                    id: nick,
                    name: nick
                },
                channel: {
                    id: to,
                    name: to
                }
            } as Module.Event;
            this.event.emit('event', data);
        });
        return {
            source: this.event
        };
    },
    transmitter (bot) {
        return {
            send: (target, message) => {
                if (typeof message === 'string') return this.client.say(target.id, message);
                if (typeof message === 'object' && message.text) return this.client.say(target.id, message.text);
                if (Array.isArray) this.client.say(target.id, message.map(transformSegment).join(''));
            }
        };
    },
    features: {}
} as Module.Platform;
