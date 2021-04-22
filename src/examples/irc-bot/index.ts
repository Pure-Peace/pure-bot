import irc from '../../packages/platforms/irc';
import Bot from '../../packages/bot';
import ModuleBuilder from '../../packages/utils/module-builder';
import { Context } from 'types';
const dev = [];
const filter = new ModuleBuilder().filter((context: Context.All) => {
    if (!dev.includes(context.source.sender.id)) return false;
    console.log(context.source.sender);
    if (context.private?.message) context.send('your message got filtered');
    return false;
}).export();
(async () => {
    const ircInstance = await irc.instance({
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
    bot.reuse(irc, ircInstance);
    manager.reuse(irc, ircInstance);

    await bot.use(new ModuleBuilder().handle(() => (context) => context.message && context.send(['收到消息:', context.message.text])).export());

    let filterSymbol = await bot.use(filter);
    let filterInstance;
    manager.use({
        instance: () => ({
            allow: false
        }),
        handle () {
            return async (context, next) => {
                const isManager = context.source?.sender?.id === 'arily';
                if (!isManager) return next();
                if (context.message.text === '!switch') {
                    this.switched ? filterSymbol = await bot.reuse(filter, filterInstance) : filterInstance = await bot.remove(filterSymbol);
                    this.switched = !this.switched;
                    context.send(['bot:', this.switched ? 'active' : 'disabled']);
                }
                if (context.message.text.startsWith('!dev')) {
                    const id = context.message.text.slice(4).trim();
                    if (!id) return context.send(['current tester: ', dev.join(', ')]);
                    if (!dev.includes(id)) context.send(`add ${id} to test list`).then(() => dev.push(id));
                    else context.send(`remove ${id} from test list`).then(() => dev.splice(dev.findIndex(u => u === id), 1));
                } else next();
            };
        }
    });
})();
