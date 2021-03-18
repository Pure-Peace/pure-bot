'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.MessageContext = exports.CqApi = exports.BotManager = exports.QQbot = void 0;
const qqbot_1 = require("./src/qqbot");
Object.defineProperty(exports, "QQbot", { enumerable: true, get: function () { return qqbot_1.QQbot; } });
const manager_1 = require("./src/manager");
Object.defineProperty(exports, "BotManager", { enumerable: true, get: function () { return manager_1.BotManager; } });
const cq_api_1 = require("./src/cq_api");
Object.defineProperty(exports, "CqApi", { enumerable: true, get: function () { return cq_api_1.CqApi; } });
const context_1 = require("./src/context");
Object.defineProperty(exports, "MessageContext", { enumerable: true, get: function () { return context_1.MessageContext; } });
const utils = require("./src/utils");
exports.utils = utils;
//# sourceMappingURL=index.js.map