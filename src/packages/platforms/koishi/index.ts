/* eslint-disable no-unreachable */
import { Context, Module } from 'types';
import { App, segment, Session } from 'koishi';
import { EventEmitter } from 'events';
import { stringMessage, transformKoishiSegment } from './uitls';

const installedAdapters = [];
export default {
    platform: ['onebot'],
    instance ({ koishi: { options = {}, adapters = [] } = {} }) {
        adapters?.forEach(adapter => {
            if (!installedAdapters.includes(adapter)) require(adapter);
            installedAdapters.push(adapter);
        });
        const koishi = new App(options);
        koishi.start();
        return {
            koishi
        };
    },

    receiver () {
        const source = new EventEmitter();
        this.middleware = (session: Session, next) => {
            const { platform, type, messageId } = session;
            if (type === 'message') {
                const { subtype: scope } = session;
                const segments = segment.parse(session.content);

                source.emit('event', {
                    id: messageId,
                    platform,
                    type,
                    scope,
                    message: {
                        quote: session.quote?.messageId,
                        get text () { return segments.filter(s => s.type === 'text').map(s => s.data.content).join('') },
                        raw: session.content,
                        get segments () { return segments.map(segment => transformKoishiSegment(segment)) }
                    },
                    source: {
                        sender: {
                            id: session.author.userId,
                            name: session.author.username,
                            _koishiSession: session,
                            platform
                        },
                        group: session.subtype === 'group'
                            ? {
                                id: session.groupId,
                                name: session.author.nickname,
                                _koishiSession: session,
                                platform
                            }
                            : undefined
                    }
                });
            }
            next();
        };
        this.dispose = this.koishi.middleware(this.middleware);
        return {
            source
        } as Module.Receiver;
    },

    uninstall () {
        if (!this.dispose) return;
        this.dispose();
        delete this.dispose;
    },

    transmitter () {
        return {
            send (target: Context.Source.Sender & {_koishiSession?: any, platform?: string}, message) {
                const str = stringMessage(message);
                if (!target._koishiSession) return this.koishi.bots.find(b => b).sendMessage(target.id.toString(), str);
                if (target._koishiSession.author.userId === target.id) return target._koishiSession.send(str);
                const bot = this.koishi.bots.find(bot => bot.platform === target.platform) || this.bots.find(a => a);
                return bot.sendMessage(target.id.toString(), str);
            }
        };
    },
    features: {}
} as Module.Platform;
