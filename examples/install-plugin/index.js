'use strict';
const { onebot: { QQbot }, utils } = require('../../dist');

utils.showBanner();

const bot = new QQbot({
    name: '阿光',
    logUnhandledInfo: true, // 打印未被处理的事件
    logHeartbeat: false, // 打印心跳事件
    debug: false, // debug，开启将显示被filter阻止的事件
    serverOptions: {
        port: 8080 // 反向websocket端口
    }
});

const fakeMessage = (msg) => ({
    time: new Date().getTime(),
    self_id: 123,
    post_type: 'message',
    message_type: 'private',
    sub_type: 'friend',
    message_id: Math.random(),
    message: msg.toString(),
    raw_message: msg.toString()
});

(async () => {
    await bot.use(require('../../dist/packages/pure-plugin-proposal'));
    await bot.use(require('../../dist/packages/pure-plugin-proposal'));
    await bot.use(require('../../dist/packages/pure-plugin-proposal'));
    await bot.use(require('../../dist/packages/pure-plugin-proposal'));
    await bot.use(require('../../dist/packages/pure-plugin-proposal'));
    await bot.start();

    bot.fakeMessage(fakeMessage('hi'));
})();
