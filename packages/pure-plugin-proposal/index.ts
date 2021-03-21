const singleton: Record<any, any> = {
    count: 0
};

module.exports = {
    name: 'pure-plugin-proposal',
    // return a instance
    instance (options) {
        return {
            options,
            instanceVariable: 0
        };
    },
    create () {
        singleton.count += 1;
        console.log('have access to singleton variables', singleton);
        console.log('have access to plugin instance as this', this);
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
            this.lastActivity = ctx.database?.user?.lastActivity; // ok
            this.someUndefinedVariables = ctx.database?.channel?.someUndefinedVariables; // Null, undefined or throw error?
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
        onMessage (ctx) {
            console.log('Unmanaged onMessage hook have access to instance as this', this);
            console.debug('unmanaged onMessage hook recived message', ctx.raw_message);
        },
        onPrivateMessage (ctx) {
            console.debug('unmanaged onPrivateMessage hook message', ctx.raw_message);
        },
        onPublicMessage (ctx) {
            console.debug('unmanaged onPublicMessage hook recived message (includes channel message (irc, khl, discord) and group message (onebot))', ctx.raw_message);
        },
        onChannelMessage (ctx) {
            console.debug('unmanaged onChannelMessage hook recived message (irc, khl, discord)', ctx.raw_message);
        },
        onGroupMessage (ctx) {
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
