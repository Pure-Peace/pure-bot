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
    const pluginInstance = await bot.remove(await installedPlugin);
    console.log('removed plugin from bot[1]');
    setTimeout(() => {
        bot.reuse(plugin, pluginInstance);
        console.log('bot[1] reuses plugin instance created by bot[1]');
    }, 2000);
}, 2000);
setTimeout(async () => {
    const providerInstance = await bot2.remove(await bot2Provider);
    console.log('removed provider from bot[2]');
    setTimeout(() => {
        bot2.reuse(provider, providerInstance);
        console.log('bot[2] reuses provider instance created by bot[1]');
    }, 2000);
}, 2000);
