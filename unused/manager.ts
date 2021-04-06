'use strict';
import { QQbot } from './old-bot/onebot/qqbot';

export class BotManager {
    bots: Array<QQbot>;
    constructor (botList: Array<QQbot>) {
        this.bots = botList;

        ['onMessage', 'onNotice', 'onRequest', 'onRequest', 'onLifecycle'].forEach(item => {
            this[item + 'All'] = (...args) => {
                this.bots.forEach(bot => {
                    bot[item](...args);
                });
            };
        });
    }
};
