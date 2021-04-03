import { Module } from '../../src/types';

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
            console.log('plugin: processed message', ctx.message);
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
        message (ctx) {
            console.log('Unmanaged onMessage hook have access to instance as this', this);
            console.debug('unmanaged onMessage hook recived message', ctx.message);
        },
        privateMessage (ctx) {
            console.debug('unmanaged onPrivateMessage hook message', ctx.message);
        },
        publicMessage (ctx) {
            console.debug('unmanaged onPublicMessage hook recived message (includes channel message (irc, khl, discord) and group message (onebot))', ctx.message);
        },
        channelMessage (ctx) {
            console.debug('unmanaged onChannelMessage hook recived message (irc, khl, discord)', ctx.message);
        },
        groupMessage (ctx) {
            console.debug('unmanaged onGroupMessage hook recived message (irc, khl, discord)', ctx.message);
        }
    },
    // database: no-cache
    database: {
        // getter, setter and method have instance as this
        fields: {
            user: {
                lastActivity: {
                    get (user) {
                        return user.lastActivity || null;
                    },
                    set (user, newValue) {
                        user.lastActivity = newValue;
                    }
                }
            },
            channel: {
                LastActiveUser: {
                    get (channel) {
                        return channel.lastActiveUser || null;
                    },
                    set (channel, newValue) {
                        channel.lastActiveUser = newValue;
                    }
                }
            }
        },
        methods: {
            user: {
                update (user) {
                    user.lastActivity = new Date();
                }
            }
        },
        extend: {
            user: {
                lastActivity: {
                    type: Date,
                    default: () => new Date(0) // have instance as this
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
        collections: {
            registeredUser: 'registered-users'
        }
    }
} as Module.Plugin;
