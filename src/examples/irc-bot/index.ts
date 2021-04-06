import platform from '../../packages/platforms/irc';
import Bot from '../../packages/bot';

const bot = new Bot({});
const irc = bot.use(platform, {
    host: '47.243.59.11',
    nickname: 'arilychan',
    username: 'arilychan',
    list: [{
        channelId: '#osu',
        channelName: '#osu'
    }],
    password: '404470f6efd4cc2d0e812af84851c8a2'
});
bot.use({
    instance () { return {} },
    handle () { return [] },
    hooks: {
        message: (context) => {
            // console.log(context);
            context.send(['收到消息:', context.message.text]);
        }
    }
});
