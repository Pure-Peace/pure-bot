import provider from './provider';
import Bot from './bot';
const plugin = require('../pure-plugin-proposal');

const bot = new Bot({});
bot.use(provider, {});
bot.use(plugin, {});
