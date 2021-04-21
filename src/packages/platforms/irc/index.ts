import { Module, Context } from 'types';
import { Channel } from './types';
const EventEmitter = require('events');
const irc = require('irc');
const pEvent = require('p-event');
const transformSegment = (segment: Context.Message) => {
    if (typeof segment === 'string') return segment;
    const messages: string[] = [];
    if (segment.notify) messages.push(segment.notify.id.toString());
    if (segment.quote) { console.log('todo: messageId') }; // todo messageId
    if (segment.text) messages.push(segment.text);
    // if (segment.image) messages.push(segment.image) // todo: file server
    return messages.join('');
};
export default {
    name: 'pure-platform-irc',
    platform: 'irc',
    async instance (options) {
        const self = {
            ...options,
            options,
            client: new irc.Client(options.host, options.nickname, {
                ...options,
                userName: options.username
            }),
            event: new EventEmitter()
        };
        self.getChannelList = async (): Promise<Channel[]> => {
            if (self.list) return self.list;
            self.client.list();
            const list = await pEvent(self.client, 'channellist', { timeout: self.timeout || 10 * 1000 });
            self.list = list.map((channel) => ({
                channelId: channel.name,
                channelName: channel.name,
                topic: channel.topic
            }));
            return list;
        };
        // eslint-disable-next-line no-unused-vars
        self.getChannel = async (channelId): Promise<Channel> => {
            return (await self.getChannelList()).find((channel) => channel.name === channelId);
        };
        const logger = console;
        self.client.connect();
        self.client.addListener('error', function (message) {
            logger.error('error: ', message);
        });
        const data = await pEvent(self.client, 'registered', { timeout: self.timeout || 10 * 1000 }).catch(error => {
            console.log(error);
        });
        if (!data) throw new Error('error when logging in');

        logger.log('logged in', data);

        const channels = await self.getChannelList();
        console.table(channels);
        channels.map((channel) => self.client.join(channel.channelId, () => logger.log('joined', channel.channelId)));
        logger.log('joined all channels');
        self.client.on('message', (nick, to, text, message) => {
            // logger.log('received message', { nick, to, text });
            const data = {
                id: [nick, to, Math.random()],
                type: 'message',
                timestamp: new Date(),
                scope: to.startsWith('#') ? 'channel' : 'private',
                message: {
                    text,
                    notify: text.includes(self.options.nickname),
                    segments: [{
                        text
                    }]
                },
                source: {
                    sender: {
                        id: nick,
                        name: nick
                    },
                    channel: to.startsWith('#') && {
                        id: to,
                        name: to
                    }
                }
            } as Module.Event;
            self.event.emit('event', data);
        });
        return self;
    },
    async receiver (bot) {
        return {
            source: this.event
        };
    },
    transmitter (bot) {
        return {
            send: (target, message) => {
                if (typeof message === 'string') return this.client.say(target.id, message);
                if (Array.isArray(message)) this.client.say(target.id, message.map(transformSegment).join(''));
                else if (typeof message === 'object' && message.text) return this.client.say(target.id, message.text);
            }
        };
    },
    features: {}
} as Module.Platform;
