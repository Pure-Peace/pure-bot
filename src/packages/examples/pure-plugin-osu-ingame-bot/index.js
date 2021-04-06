const OsuApiV2 = require('some-dependency');
const template = require('./help/i18n');

module.exports = {
    name: 'pure-plugin-osu-ingame-bot',
    async instance (options) {
        const apiInstance = new OsuApiV2();
        return {
            options: {
                ...options
            },
            apiV2: apiInstance
        };
    },
    create () {
        return (ctx, next) => {
            const m = ctx.osu?.message;
            if (!m) return next();

            if (m.text?.startsWith('!help')) {
                return ctx.send({
                    at: m.sender?.id,
                    text: template('help', { locale: this.database?.user?.locale || 'en-GB' })
                });
            } else if (m.text?.startsWith('!mp')) {
                if (m.text.startsWith('!mp close')) {
                    const room = m.text.slice(9).trim();
                    try {
                        const result = await this.apiV2.sudoUser(m.sender.id).closeRoom(room);
                        ctx.send({
                            at: m.sender?.id,
                            text: result.success
                                ? template('mp.close.success', { room, locale: this.database?.user?.locale || 'en-GB' })
                                : template('mp.close.fail', { room, locale: this.database?.user?.locale || 'en-GB' })
                        });
                    } catch (error) {
                        ctx.send({
                            at: m.sender?.id,
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
