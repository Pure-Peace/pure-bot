import { Module, Context } from 'types';

const EventEmitter = require('events');
const irc = require('irc');
const pEvent = require('p-event');

module.exports = {
    name: 'pure-platform-irc',
    platform: 'irc',
    instance (options) {
        return {
            options,
            client: new irc.Client(options.host, options.nickname, {
                ...options,
                userName: options.username
            }),
            event: new EventEmitter()
        };
    },
    async receiver () {
        const logger = console;
        this.client.connect();
        this.client.addListener('error', function (message) {
            logger.error('error: ', message);
        });
        await pEvent(this.client, 'registered', { timeout: this.timeout || 10 * 1000 }).catch(error => {
            throw error;
        });
        logger.debug('logged in');

        const channels = await this.getChannelList();
        console.table(channels);
        channels.map((channel) => this.client.join(channel.channelId, () => logger.debug('joined', channel.channelId)));
        logger.debug('joined all channels');
        this.client.on('message', (nick, to, text, message) => {
            logger.debug('received message', { nick, to, text });
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
                }
            } as Module.Event;
            this.event.emit('event', data);
        });
        return {
            source: this.event
        };
    },
    transmitter () {
        return {
            send: (target, message) => console.log('sending message', message, 'to', target)
        };
    },
    features: {}
} as Module.Platform;
