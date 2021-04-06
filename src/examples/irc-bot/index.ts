import platform from '../../packages/platforms/irc';
import Bot from '../../packages/bot';
import ModuleBuilder from '../../packages/utils/module-builder';

(async () => {
    const bot = new Bot({});
    const irc = bot.use(platform, {
        host: '47.243.59.11',
        nickname: 'arilychan',
        username: 'arilychan',
        list: [{
            channelId: '#osu',
            channelName: '#osu'
        }],
        password: 'bdd3729edf783bdaa7e5d5d2c9f06a23'
    });
    const anonymouns = await bot.use(new ModuleBuilder().handle(() => (context) => context.message && context.send(['收到消息:', context.message.text])).export());
    bot.use(new ModuleBuilder().filter((context) => {
        console.log(context.source.sender);
        return context.source.sender && context.source.sender?.id === 'arily';
    }).export());
})();
