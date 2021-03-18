"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBanner = void 0;
const chalk = require('chalk');
const { successBox } = require('./formatting');
const { getFormattedMemoryUsage } = require('./memory');
const isDev = process.env.NODE_ENV === 'development';
function showBanner(options, showMemoryUsage = true) {
    const opt = Object.assign({
        banner: '',
        messages: [],
        bannerColor: 'green',
        name: process.env.npm_package_name || 'pure-bot',
        version: process.env.npm_package_version || '.'
    }, options);
    const titleLines = [];
    const messageLines = [];
    titleLines.push(`${chalk[opt.bannerColor].bold(opt.banner)}\n`);
    titleLines.push(`${chalk[opt.bannerColor].bold(opt.name)} @ v${opt.version}\n`);
    const label = name => chalk.bold.cyan(`▸ ${name}:`);
    titleLines.push(`${label('Node')}        v${process.env.npm_config_node_version}`);
    titleLines.push(`${label('Environment')} ${process.env.NODE_ENV}`);
    if (showMemoryUsage) {
        titleLines.push('\n' + getFormattedMemoryUsage());
    }
    if (opt.messages.length) {
        messageLines.push('', ...opt.messages);
    }
    process.stdout.write(successBox(messageLines.join('\n'), titleLines.join('\n')));
}
exports.showBanner = showBanner;
//# sourceMappingURL=banner.js.map