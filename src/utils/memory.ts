const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');

function getMemoryUsage () {
    // https://nodejs.org/api/process.html#process_process_memoryusage
    const { heapUsed, rss } = process.memoryUsage();
    return { heap: heapUsed, rss };
}

function getFormattedMemoryUsage () {
    const { heap, rss } = getMemoryUsage();
    return `Memory usage: ${chalk.bold(prettyBytes(heap))} (RSS: ${prettyBytes(rss)})`;
}

function showMemoryUsage () {
    console.info(getFormattedMemoryUsage());
}

export {
    getMemoryUsage,
    getFormattedMemoryUsage,
    showMemoryUsage
};
