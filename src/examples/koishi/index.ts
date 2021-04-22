import koishi from '../../packages/platforms/koishi';
import Bot from '../../packages/bot';
import ModuleBuilder from '../../packages/utils/module-builder';
import { Context } from 'types';
const dev = [];
const filter = new ModuleBuilder().filter((context: Context.All) => {
    if (!dev.includes(context.source.sender.id)) return false;
    // if (context.private?.message) context.send('your message got filtered');
    return false;
}).export();
(async () => {
    const platformInstance = await koishi.instance({
        koishi: {
            options: {
                port: 7070,
                logLevel: 3,
                bots: [{
                    type: 'onebot:ws',
                    server: 'http://localhost:6700',
                    name: '小阿日',
                    commandPrefix: ['!', '！'],
                    selfId: 3266654349
                }]
            },
            adapters: ['koishi-adapter-onebot']
        }
    });

    const bot = new Bot({});
    const manager = new Bot({});
    bot.reuse(koishi, platformInstance);
    manager.reuse(koishi, platformInstance);

    await bot.use(new ModuleBuilder().handle(() => (context) => context.message && context.send(['收到消息:', context.message.text])).export());

    let filterSymbol = await bot.use(filter);
    let filterInstance;
    manager.use({
        instance: () => ({
            allow: false
        }),
        handle () {
            return async (context, next) => {
                const isManager = context.source?.sender?.id === '879724291';
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
