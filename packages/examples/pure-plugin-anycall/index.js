const { consts } = require('pure-bot');
function resolve (path, obj = self, separator = '.') {
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}
module.exports = {
    name: 'pure-plugin-anycall',
    async instance (options) {
        return {
            options: {
                ...{
                    miniumSendingInterval: 5 * 1000
                },
                ...options
            }
        };
    },
    create () {
        return (ctx, next) => {
            // message format: send <platform.subPlatform> <targetId> <message>
            const m = ctx.message;
            if (!m.text?.startsWith('!send')) return next();
            const command = m.split(' ');
            const platform = command[1];
            const targetId = command[2];
            const message = command.slice(3).join(' ');

            const targetPlatform = resolve(platform, ctx);

            if (
                m.sender?.roles?.includes(consts.BOT_OWNER) ||
                new Date() - ctx.database?.user?.lastSentMessage ?? new Date(0) > this.options.miniumSendingInterval ||
                targetPlatform?.bots?.length
            ) {
                for (bot of targetPlatform.bots) {
                    try {
                        const result = await bot.sendMessage(targetId, message);
                        if (result.id) return;
                    } catch (error) {
                        continue;
                    }
                }
            }
        };
    },
    database: {
        fields: {
            // default behavior if no declare getter, setter
            // user: {
            //     lastSentMessage: {
            //         get (user) {
            //             return user.lastSentMessage;
            //         },
            //         set (user, newVal) {
            //             user.lastSentMessage = newVal;
            //         }
            //     }
            // }
        },
        extends: {
            user: {
                lastSentMessage: {
                    type: Date,
                    default: () => new Date(0)
                }
            }
        }
    }
};
