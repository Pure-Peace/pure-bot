'use strict';
import { showBanner } from './banner';
const formatting = require('./formatting');
const memory = require('./memory');

class Duration {
    start: bigint;
    end: bigint;
    duration: bigint;
    isElapsed: boolean;
    constructor () {
        this.restart();
    }

    restart () {
        this.start = process.hrtime.bigint();
    }

    elapsed () {
        this.end = process.hrtime.bigint();
        this.duration = this.end - this.start;
        this.isElapsed = true;
        return this;
    }

    digit () {
        return this.duration;
    }

    format () {
        if (this.duration > 1000000000) {
            return `${this.duration / 1000000000n}s`;
        } else if (this.duration > 1000000) {
            return `${this.duration / 1000000n}ms`;
        } else if (this.duration > 1000) {
            return `${this.duration / 1000n}us`;
        } else {
            return `${this.duration}ns`;
        }
    }
}

const isAsyncFn = (func) => {
    return func.constructor.name === 'AsyncFunction';
};

export {
    Duration,
    isAsyncFn,
    showBanner,
    formatting,
    memory
};
