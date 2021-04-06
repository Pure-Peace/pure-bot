import platform from '../../packages/platforms/irc';
import Bot from '../../packages/bot';
import ModuleBuilder from '../../packages/utils/module-builder';

const bot = new Bot({});
const irc = bot.use(platform, {
    host: '47.243.59.11',
    nickname: 'arilychan',
    username: 'arilychan',
    list: [{
        channelId: '#osu',
        channelName: '#osu'
    }],
    password: ''
});
bot.use(new ModuleBuilder().handle(() => (context) => context.message && context.send(['收到消息:', context.message.text])).export());
