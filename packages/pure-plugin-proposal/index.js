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
            console.log('processed message', ctx);

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
        };
    },
    hooks: {
        onMessage (ctx, namespace) {
            console.debug('recived message', ctx);
        },
        onPrivateMessage (ctx, namespace) {
            console.debug('recived private message', ctx);
        },
        onPublicMessage (ctx, namespace) {
            console.debug('recived public message (includes channel message (irc, khl, discord) and group message (onebot))', ctx);
        },
        onChannelMessage (ctx, namespace) {
            console.debug('recived channel message (irc, khl, discord)');
        },
        onGroupMessage (ctx, namespace) {
            console.debug('recived channel message (irc, khl, discord)');
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
