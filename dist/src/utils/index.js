'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.memory = exports.formatting = exports.showBanner = exports.isAsyncFn = exports.Duration = void 0;
const banner_1 = require("./banner");
Object.defineProperty(exports, "showBanner", { enumerable: true, get: function () { return banner_1.showBanner; } });
const formatting = require('./formatting');
exports.formatting = formatting;
const memory = require('./memory');
exports.memory = memory;
class Duration {
    constructor() {
        this.restart();
    }
    restart() {
        this.start = process.hrtime.bigint();
    }
    elapsed() {
        this.end = process.hrtime.bigint();
        this.duration = this.end - this.start;
        this.isElapsed = true;
        return this;
    }
    digit() {
        return this.duration;
    }
    format() {
        if (this.duration > 1000000000) {
            return `${this.duration / 1000000000n}s`;
        }
        else if (this.duration > 1000000) {
            return `${this.duration / 1000000n}ms`;
        }
        else if (this.duration > 1000) {
            return `${this.duration / 1000n}us`;
        }
        else {
            return `${this.duration}ns`;
        }
    }
}
exports.Duration = Duration;
const isAsyncFn = (func) => {
    return func.constructor.name === 'AsyncFunction';
};
exports.isAsyncFn = isAsyncFn;
//# sourceMappingURL=index.js.map