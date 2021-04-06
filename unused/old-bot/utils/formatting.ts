const wrapAnsi = require('wrap-ansi');
const chalk = require('chalk');
const boxen = require('boxen');

function maxCharsPerLine () {
    return (process.stdout.columns || 100) * 80 / 100;
}

function indent (count, chr = ' ') {
    return chr.repeat(count);
}

function indentLines (string, spaces, firstLineSpaces) {
    const lines = Array.isArray(string) ? string : string.split('\n');
    let s = '';
    if (lines.length) {
        const i0 = indent(firstLineSpaces === undefined ? spaces : firstLineSpaces);
        s = i0 + lines.shift();
    }
    if (lines.length) {
        const i = indent(spaces);
        s += '\n' + lines.map(l => i + l).join('\n');
    }
    return s;
}

function foldLines (string, spaces, firstLineSpaces, charsPerLine = maxCharsPerLine()) {
    return indentLines(wrapAnsi(string, charsPerLine), spaces, firstLineSpaces);
}

function colorize (text) {
    return text
        .replace(/\[[^ ]+]/g, m => chalk.grey(m))
        .replace(/<[^ ]+>/g, m => chalk.green(m))
        .replace(/ (-[-\w,]+)/g, m => chalk.bold(m))
        .replace(/`([^`]+)`/g, (_, m) => chalk.bold.cyan(m));
}

function box (message, title, options) {
    return boxen([
        title || chalk.white('Message'),
        '',
        chalk.white(foldLines(message, 0, 0))
    ].join('\n'), Object.assign({
        borderColor: 'white',
        borderStyle: 'round',
        padding: 1,
        margin: 1
    }, options)) + '\n';
}

function successBox (message, title) {
    return box(message, title || chalk.green('✔ Success'), {
        borderColor: 'green'
    });
}

function warningBox (message, title) {
    return box(message, title || chalk.yellow('⚠ Warning'), {
        borderColor: 'yellow'
    });
}

function errorBox (message, title) {
    return box(message, title || chalk.red('✖ Error'), {
        borderColor: 'red'
    });
}

function fatalBox (message, title) {
    return errorBox(message, title || chalk.red('✖ Fatal Error'));
}

export {
    maxCharsPerLine,
    indent,
    indentLines,
    foldLines,
    colorize,
    box,
    successBox,
    warningBox,
    errorBox,
    fatalBox
};
