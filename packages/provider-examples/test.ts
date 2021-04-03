import provider from './provider';
import Bot from './bot';
const plugin = require('./plugin');

const bot = new Bot({});
const bot2 = new Bot({});
bot.use(provider, {});
const bot2Provider = bot2.use(provider, {});
const installedPlugin = bot.use(plugin, {});
bot2.use(plugin, {});

setTimeout(async () => {
    bot.remove(await installedPlugin);
    console.log('removed plugin from bot[1]');
}, 3000);
setTimeout(async () => {
    bot2.remove(await bot2Provider);
    console.log('removed provider from bot[2]');
}, 6000);
