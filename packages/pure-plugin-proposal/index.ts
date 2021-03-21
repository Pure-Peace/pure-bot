const singleton: Record<any, any> = {};

module.exports = {
    name: 'pure-plugin-proposal',
    instance (options: Partial<any>) {
        // create new instance everytime a plugin is initialized
        return {
            options
        };
    },
    create (instance: Partial<any>) {
        console.log('have access to singleton variables', singleton);
        console.log('have access to plugin instance', instance);
        return (ctx, next) => {
            console.log('plugin: processed message', ctx.raw_message);
            console.log(new Error('next function do not appear in the call stack').stack);
            next();
            console.log('codes after next() is also executed and execute before next plugin');
            return next();

            // eslint-disable-next-line no-unreachable
            console.log('call next multiple times will not create a error but not recommended');
            // database methods
            // allow pre-defiend getter setter only
            instance.lastActivity = ctx.database?.user?.lastActivity; // ok
            instance.someUndefinedVariables = ctx.database?.channel?.someUndefinedVariables; // Null, undefined or throw error?
            ctx.database.user.lastActivity = new Date();

            // reply shortcut
            ctx.reply({
                content: 'quick reply'
            });
            // or
            ctx.reply('quick reply');

            // equals to
            ctx.send({
                reply: ctx,
                content: 'quick reply'
            });
        };
    },
    hooks: {
        onMessage (ctx, instance) {
            console.debug('unmanaged onMessage hook recived message', ctx.raw_message);
        },
        onPrivateMessage (ctx, instance) {
            console.debug('unmanaged onPrivateMessage hook message', ctx.raw_message);
        },
        onPublicMessage (ctx, instance) {
            console.debug('unmanaged onPublicMessage hook recived message (includes channel message (irc, khl, discord) and group message (onebot))', ctx.raw_message);
        },
        onChannelMessage (ctx, instance) {
            console.debug('unmanaged onChannelMessage hook recived message (irc, khl, discord)', ctx.raw_message);
        },
        onGroupMessage (ctx, instance) {
            console.debug('unmanaged onGroupMessage hook recived message (irc, khl, discord)', ctx.raw_message);
        }
    },
    // database: no-cache
    database: {
        methods: {
            user: {
                lastActivity: {
                    get (user, instance) {
                        return user.lastActivity || null;
                    },
                    set (user, instance) {
                        user.lastActivity = new Date();
                    }
                }
            },
            channel: {
                LastActiveUser: {
                    get (channel, instance) {
                        return channel.lastActiveUser || null;
                    },
                    set (channel, newValue, instance) {
                        channel.lastActiveUser = newValue;
                    }
                }
            }
        },
        extend: {
            user: {
                lastActivity: {
                    type: Date,
                    default: (instance) => new Date(0)
                }
            },
            channel: {
                lastActiveUser: {
                    type: String,
                    default: undefined
                }
            },
            bot: {
                // accessable across different plugin instances as long as the bot's account is the same
                someField: {
                    type: Object,
                    default: () => {}
                }
            }
        },
        // declare collection, provided in ctx.database.collection[<key>] as MongoLike.collection(<key>)
        collection: {
            registeredUser: 'registered-users'
        }
    }
};
