import platform from '../../packages/platforms/irc';
import Bot from '../../packages/bot';
import ModuleBuilder from '../../packages/utils/module-builder';
const filter = new ModuleBuilder().filter((context) => {
    console.log(context.source.sender);
    context.send('your message got filtered');
    return false;
}).export();
(async () => {
    const ircInstance = await platform.instance({
        host: '47.243.59.11',
        nickname: 'arilychan',
        username: 'arilychan',
        list: [{
            channelId: '#osu',
            channelName: '#osu'
        }],
        password: ''
    });

    const bot = new Bot({});
    const manager = new Bot({});
    bot.reuse(platform, ircInstance);
    manager.reuse(platform, ircInstance);

    await bot.use(new ModuleBuilder().handle(() => (context) => context.message && context.send(['收到消息:', context.message.text])).export());

    let filterSymbol = await bot.use(filter);
    let filterInstance;
    manager.use({
        instance: () => ({
            switched: true
        }),
        handle () {
            return async (context, next) => {
                const isManager = context.source?.sender?.id === 'arily';
                if (!isManager) return next();
                if (context.message.text !== '!switch') return next();
                this.switched ? filterInstance = await bot.remove(filterSymbol) : filterSymbol = await bot.reuse(filter, filterInstance);
                this.switched = !this.switched;
            };
        }
    });
})();
