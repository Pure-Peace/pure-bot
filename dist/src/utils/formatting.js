"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fatalBox = exports.errorBox = exports.warningBox = exports.successBox = exports.box = exports.colorize = exports.foldLines = exports.indentLines = exports.indent = exports.maxCharsPerLine = void 0;
const wrapAnsi = require('wrap-ansi');
const chalk = require('chalk');
const boxen = require('boxen');
function maxCharsPerLine() {
    return (process.stdout.columns || 100) * 80 / 100;
}
exports.maxCharsPerLine = maxCharsPerLine;
function indent(count, chr = ' ') {
    return chr.repeat(count);
}
exports.indent = indent;
function indentLines(string, spaces, firstLineSpaces) {
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
exports.indentLines = indentLines;
function foldLines(string, spaces, firstLineSpaces, charsPerLine = maxCharsPerLine()) {
    return indentLines(wrapAnsi(string, charsPerLine), spaces, firstLineSpaces);
}
exports.foldLines = foldLines;
function colorize(text) {
    return text
        .replace(/\[[^ ]+]/g, m => chalk.grey(m))
        .replace(/<[^ ]+>/g, m => chalk.green(m))
        .replace(/ (-[-\w,]+)/g, m => chalk.bold(m))
        .replace(/`([^`]+)`/g, (_, m) => chalk.bold.cyan(m));
}
exports.colorize = colorize;
function box(message, title, options) {
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
exports.box = box;
function successBox(message, title) {
    return box(message, title || chalk.green('✔ Success'), {
        borderColor: 'green'
    });
}
exports.successBox = successBox;
function warningBox(message, title) {
    return box(message, title || chalk.yellow('⚠ Warning'), {
        borderColor: 'yellow'
    });
}
exports.warningBox = warningBox;
function errorBox(message, title) {
    return box(message, title || chalk.red('✖ Error'), {
        borderColor: 'red'
    });
}
exports.errorBox = errorBox;
function fatalBox(message, title) {
    return errorBox(message, title || chalk.red('✖ Fatal Error'));
}
exports.fatalBox = fatalBox;
