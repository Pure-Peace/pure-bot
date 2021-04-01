const { default: axios } = require('axios');
const OsuApiV2 = require('some-dependency');
const template = require('./help/i18n');
const defaultOptions = {
    base: 'https://info.osustuff.ri.mk/cn'
};

module.exports = {
    name: 'pure-plugin-osu-ingame-bot',
    async instance (options) {
        const apiInstance = new OsuApiV2();
        return {
            options: {
                ...defaultOptions,
                options
            },
            apiV2: apiInstance
        };
    },
    create () {
        return (ctx, next) => {
            if (!ctx.irc?.osu?.message) return next(); // not a osu irc message event

            if (ctx.message.text?.startsWith('!help')) {
                return ctx.send({
                    at: ctx.message.sender?.id,
                    text: template('help', { locale: this.database?.user?.locale || 'en-GB' })
                });
            } else if (ctx.message.text?.startsWith('!mp')) {
                if (ctx.message.text.startsWith('!mp close')) {
                    const room = ctx.message.text.slice(9).trim();
                    try {
                        const result = await this.apiV2.sudoUser(ctx.message.sender.id).closeRoom(room);
                        ctx.send({
                            at: ctx.message.sender?.id,
                            text: result.success
                                ? template('mp.close.success', { room, locale: this.database?.user?.locale || 'en-GB' })
                                : template('mp.close.fail', { room, locale: this.database?.user?.locale || 'en-GB' })
                        });
                    } catch (error) {
                        ctx.send({
                            at: ctx.message.sender?.id,
                            text: template('mp.close.fail', { reason: error.reason, locale: this.database?.user?.locale || 'en-GB' })
                        });
                    }
                }
            }
        };
    },
    database: {
        virtual: {
            user: {
                get (ctx) {
                    return this.apiV2.getUser(ctx.sender?.id);
                }
            }
        }
    }
};
