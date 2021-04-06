const nodemon = require('nodemon');
const chalk = require('chalk');

const target = process.argv.slice(2)[0] ?? 'common';
const args = process.argv.slice(3).join(' ');

console.log(chalk.yellowBright(`[start] [ENV: ${process.env.NODE_ENV}] Try run example ${chalk.green(target)} with args: ${args}.`));

nodemon({
    restartable: 'rs',
    ignore: [
        '.git',
        'node_modules/**/node_modules'
    ],
    verbose: false,
    exec: `tsc --build && node ./dist/examples/${target} ${args}`,
    watch: [
        '.'
    ],
    ext: 'js,ts'
});
