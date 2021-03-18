'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotManager = void 0;
class BotManager {
    constructor(botList) {
        this.bots = botList;
        ['onMessage', 'onNotice', 'onRequest', 'onRequest', 'onLifecycle'].forEach(item => {
            this[item + 'All'] = (...args) => {
                this.bots.forEach(bot => {
                    bot[item](...args);
                });
            };
        });
    }
}
exports.BotManager = BotManager;
;
//# sourceMappingURL=manager.js.map