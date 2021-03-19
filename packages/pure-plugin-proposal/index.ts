const singletonNamespace = {};

module.exports = {
    name: 'pure-plugin-proposal',
    namespace (options) {
        // create new namespace everytime a plugin is initialized
        return {
            options
        };
    },
    create (options, namespace) {
        console.log('have access to singleton namespace', singletonNamespace);
        console.log('have access to plugin namespace', namespace);
        return (ctx, next) => {
            console.log('plugin: processed message', ctx.raw_message);
            console.log(new Error('next function do not appear in the call stack').stack);
            next();
            console.log('codes after next() is also executed and execute before next plugin');
            /*
            // database methods
            // allow pre-defiend getter setter only
            const myLastMove = ctx.database.user.lastActivity;
            ctx.database.user.lastActivity = new Date();

            // reply shortcut
            ctx.reply({
                content: myLastMove
            });

            // equals to
            ctx.send({
                reply: ctx,
                content: myLastMove
            });
            */
        };
    },
    hooks: {
        onMessage (ctx, namespace) {
            console.debug('unmanaged onMessage hook recived message', ctx.raw_message);
        },
        onPrivateMessage (ctx, namespace) {
            console.debug('unmanaged onPrivateMessage hook message', ctx.raw_message);
        },
        onPublicMessage (ctx, namespace) {
            console.debug('unmanaged onPublicMessage hook recived message (includes channel message (irc, khl, discord) and group message (onebot))', ctx.raw_message);
        },
        onChannelMessage (ctx, namespace) {
            console.debug('unmanaged onChannelMessage hook recived message (irc, khl, discord)', ctx.raw_message);
        },
        onGroupMessage (ctx, namespace) {
            console.debug('unmanaged onGroupMessage hook recived message (irc, khl, discord)', ctx.raw_message);
        }
    },
    database: {
        methods: {
            user: {
                lastActivity: {
                    get (user, namespace) {
                        return user.lastActivity || null;
                    },
                    set (user, namespace) {
                        user.lastActivity = new Date();
                    }
                }
            },
            channel: {
                LastActiveUser: {
                    get (channel, namespace) {
                        return channel.lastActiveUser || null;
                    },
                    set (channel, newValue, namespace) {
                        channel.lastActiveUser = newValue;
                    }
                }
            }
        },
        extend: {
            user: {
                lastActivity: {
                    type: Date,
                    default: (namespace) => new Date(0)
                }
            },
            channel: {
                lastActiveUser: {
                    type: String,
                    default: undefined
                }
            }
        }
    }
};
