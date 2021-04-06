/* eslint-disable no-unused-vars */
const chalk = require('chalk');
const {
    successBox
} = require('./formatting');
const {
    getFormattedMemoryUsage
} = require('./memory');

const isDev = process.env.NODE_ENV === 'development';

function showBanner (options?, showMemoryUsage = true) {
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

    // Name and version
    titleLines.push(`${chalk[opt.bannerColor].bold(opt.name)} @ v${opt.version}\n`);

    const label = name => chalk.bold.cyan(`▸ ${name}:`);

    // Environment
    titleLines.push(`${label('Node')}        v${process.env.npm_config_node_version}`);
    titleLines.push(`${label('Environment')} ${process.env.NODE_ENV}`);

    if (showMemoryUsage) {
        titleLines.push('\n' + getFormattedMemoryUsage());
    }

    // Listeners
    /* messageLines.push(
    chalk.bold(`${chalk.green('△')} Listening: `) + chalk.underline.blue(`http://${opt.host}:${opt.port}`)
  ) */

    // Add custom messages
    if (opt.messages.length) {
        messageLines.push('', ...opt.messages);
    }

    process.stdout.write(successBox(messageLines.join('\n'), titleLines.join('\n')));
}

export {
    showBanner
};
