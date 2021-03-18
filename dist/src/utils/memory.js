"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showMemoryUsage = exports.getFormattedMemoryUsage = exports.getMemoryUsage = void 0;
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');
function getMemoryUsage() {
    // https://nodejs.org/api/process.html#process_process_memoryusage
    const { heapUsed, rss } = process.memoryUsage();
    return { heap: heapUsed, rss };
}
exports.getMemoryUsage = getMemoryUsage;
function getFormattedMemoryUsage() {
    const { heap, rss } = getMemoryUsage();
    return `Memory usage: ${chalk.bold(prettyBytes(heap))} (RSS: ${prettyBytes(rss)})`;
}
exports.getFormattedMemoryUsage = getFormattedMemoryUsage;
function showMemoryUsage() {
    console.info(getFormattedMemoryUsage());
}
exports.showMemoryUsage = showMemoryUsage;
