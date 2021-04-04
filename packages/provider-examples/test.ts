import platform from './transceiver';
import Bot from './bot';
import filter from './filter';
import plugin from './plugin';
const bot = new Bot({});
const bot2 = new Bot({});
bot.use(platform, {});
const bot2Provider = bot2.use(platform, {});
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
    const platformInstance = await bot2.remove(await bot2Provider);
    console.log('removed platform from bot[2]');
    setTimeout(() => {
        bot2.reuse(platform, platformInstance);
        console.log('bot[2] reuses platform instance created by bot[1]');
    }, 2000);
}, 2000);
setTimeout(async () => {
    bot.use(filter, { users: [] });
    bot2.use(filter, { users: [] });
    console.log('filter installed to both of the bots');
}, 6000);

export * from '../../src/types';
