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

// 注册heartbeat事件
bot.onMetaEvent('heartbeat', async (ctx) => {
    bot.info(ctx.msg.status, 'status: heartbeat meta event handler');
});

// 全局事件执行前检查器，名称需要唯一
// return false将阻止事件执行
// 并且，ckecker是顺序执行的，我们在下面注册了test1，但是test1不会触发，因为在test执行时，事件已经结束
bot.addBeforeChecker('test', async (ctx) => {
    bot.info('check: test');
    // 如果事件为心跳，则不处理
    if (ctx.msg.meta_event_type === 'heartbeat') {
        return false;
    }
});

// 全局事件执行前检查器，名称需要唯一
// return false将阻止事件执行
// 由于test返回了false，test1不会执行。
bot.addBeforeChecker('test1', async (ctx) => {
    bot.info('check: test1');
    // 如果事件为心跳，则不处理
    if (ctx.msg.meta_event_type === 'heartbeat') {
        return false;
    }
});

// 收到私信时处理，对应事件：message.private
bot.onMessage('private', async (ctx) => {
    try {
        // 进行回复，病等待cq api返回结果
        const result = await ctx.fastReply('快速回复');
        return result;
    } catch (err) {
        bot.error(err);
        return err;
    }
}, {
    // 三级事件，对应：message.private.friend
    // 默认为空，也就是common（不进行区分）
    where: 'friend',
    filters: {
        // 要求的消息前缀，只有消息满足条件才会调用处理
        prefixes: ['!', '!!'],
        // 支持多个正则表达式
        regexs: [],
        // 支持多个关键字匹配
        keywords: [],
        // [仅]允许调用处理的qq号列表
        include_qq: [],
        // [仅]允许调用处理的qq群号列表
        include_group: [],
        // 不允许调用处理的qq号列表
        exclude_qq: [],
        // 不允许调用处理的qq群号列表
        exclude_group: []
    },
    // 事件执行前检查器，事件执行前执行（可async）
    beforeChecker: (ctx) => {
        // 判断逻辑或检查，如用户绑定等。
        // 若return false 将中断事件
        bot.info('before checker');

        // 如果发送消息的qq不等于xx，则拒绝处理
        if (ctx.user_id !== 111) {
            console.log('拒绝！');
            return false;
        }
    },
    // 事件执行后处理器（可async）
    // 第二个参数接收事件处理完成后得到的结果（result）
    afterHandler: (ctx, result) => {
        // 事件执行完后干什么…… result为结果，可用于根据结果继续执行一些事情
        bot.info('after handler:', result);
    }
});

// qq群聊事件，对应：message.group.common
bot.onMessage('group', async (ctx) => {
    try {
        await ctx.fastReply(666);
    } catch (err) {
        console.log(err);
    }
});

// notice事件，如戳一戳，对应：notice.private.common
bot.onNotice('private', async (ctx) => {
    console.info(ctx.msg.raw_message, 'notice666');
});

// 注册一个群聊消息处理
bot.onMessage('group', async (ctx) => {
    bot.info('收到群聊消息：', ctx.raw_message);
    // 使用ctx.client 调用 CQ Api
    // 这是获取群聊信息
    try {
        const result = await ctx.client.getTargetGroupInfo({ group_id: ctx.group_id });
        bot.info('成功获取群聊消息：', result);
    } catch (err) {
        bot.error('获取群聊信息失败，错误：', err);
    }
});
