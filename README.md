# pure-bot

基于onebot，简单、易用的QQ机器人框架。

目前已测试支持 **[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)** 反向websocket。
后续可能将添加更多方式...

注意：项目刚开始写……只有最基本的功能……并且可能会遭到较大修改。

## 直接使用

安装

```
npm i pure-bot
```

下载[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)，在其配置中开启反向websocket后启动，接着启动pure-bot，将尝试自动连接。

如何配置go-cqhttp的反向websocket：

```json
// 反向WS设置
ws_reverse_servers: [
    // 可以添加多个反向WS推送
    {
        // 启用该推送
        enabled: true
        // 反向WS地址
        reverse_url: ws://127.0.0.1:8080/cqhttp/ws
        // 重连间隔 单位毫秒
        reverse_reconnect_interval: 3000
    }
]
```

**最简示例**

index.js

```javascript
const { QQbot } = require('pure-bot');

const bot = new QQbot({
    name: '阿光',
    logUnhandledInfo: true, // 打印已收到，但未被处理的事件
    logHeartbeat: false, // 打印心跳事件
    debug: false, // debug，开启将显示被filter阻止的事件
    serverOptions: {
        port: 8080 // cqhttp服务的反向websocket端口
    }
});

// 注册一个私信事件，bot将在收到私信时处理
// 事件路径：message.private.common
bot.onMessage('private', async (ctx) => {
    // bot收到你的消息后将会进行回复。
    // 执行api（如fastReply）将统一返回promise
    await ctx.fastReply('hello, world')
});
```

- **[> 完整示例可查看此处 <](https://github.com/Pure-Peace/pure-bot/blob/main/example/index.js)**

### 事件注册

支持 [onebot](https://github.com/howmanybots/onebot/blob/master/v11/specs/README.md) 协议制定的事件，共四种：

- [消息事件 (message)](https://github.com/howmanybots/onebot/blob/master/v11/specs/event/README.md)
  
- [通知事件 (notice)](https://github.com/howmanybots/onebot/blob/master/v11/specs/event/notice.md)
  
- [请求事件 (request)](https://github.com/howmanybots/onebot/blob/master/v11/specs/event/request.md)
  
- [元事件 (meta_event)](https://github.com/howmanybots/onebot/blob/master/v11/specs/event/meta.md)

**注册方法**

```typescript
bot.onMessage (type: ('common' | 'private' | 'group'), handler: (AsyncFunction | Function), options: handleOptions);
bot.onNotice (type: ('common' | 'private' | 'group'), handler: (AsyncFunction | Function), options: handleOptions);
bot.onRequest (type: ('common' | 'friend' | 'group'), handler: (AsyncFunction | Function), options: handleOptions);
bot.onMetaEvent (type: ('common' | 'lifecycle' | 'heartbeat'), handler: (AsyncFunction | Function), options: handleOptions);

// 生命周期事件，此事件实际上属于元事件 (meta_event) 
bot.onLifecycle (lifecycle: ('connect' | 'enable' | 'disable'), handler: (AsyncFunction | Function));
```

- 参数 **handleOptions**：**每种事件有不同的类型，common代表所有类型。**
- 参数 **handler**：**处理方法**，可传入异步方法(`AsyncFunction`)，也可传入普通方法，处理方法需要接收一个**上下文**(`MessageContext`)作为参数。
- 参数 **handleOptions**：**处理选项**，可定义过滤器 `filters`，也可以添加钩子（执行前处理函数、执行后处理函数）。

**`handleOptions` 东西有点多，将在后面的示例中细讲。**

事件类型总结：

**常规**

- common：所有类型
- private：仅私聊
- group：仅群聊
- friend：仅好友

**元事件**

- lifecycle：生命周期
- heartbeat：心跳事件

**生命周期**

- connect：连接到websocket时
- enable：停用onebot实现
- disable：启用onebot实现

**完整注册示例**

```javascript
// 首先创建bot实例……然后开始注册事件处理：

// 给bot注册一个私人消息事件处理
bot.onMessage('private', async (ctx) => {
    try {
        // 对发送者进行回复，同时等待onbot协议返回结果
        const result = await ctx.fastReply('666');
        return result;
    } catch (err) {
        bot.error(err);
        return err;
    }
}, /* 下面是handleOptions */ {

    // 事件过滤，此处 friend 对应：message.private.friend （仅处理私聊消息中的[好友消息]）
    // 默认为空，也就是 message.private.common（不进行区分，处理所有私聊消息）
    where: 'friend',
    // 过滤器选项
    filters: {
        // 要求的消息前缀，只有消息满足条件才会调用处理
        prefixes: ['!', '!!'],
        // 支持多个正则表达式
        regexs: [],
        // 支持多个关键字匹配，消息中出现关键字则处理
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
    // 事件执行前检查器，事件执行前执行（可传async函数，也可为普通函数）
    beforeChecker: async (ctx) => {
        // 判断逻辑或检查，如用户绑定等。
        // 若return false 将中断事件
        bot.info('before checker');

        // 如果发送消息的qq不等于xx，则拒绝处理
        if (ctx.user_id !== 111) {
            bot.warn('拒绝！');
            return false;
        }
    },
    // 事件执行后处理器（可传async函数，也可为普通函数）
    // 第二个参数接收事件处理完成后得到的结果（result）
    afterHandler: (ctx, result) => {
        // 事件执行完后干什么…… result为事件处理完后返回的结果，可用于根据结果继续执行一些事情
        bot.info('after handler:', result);
    }
});

// 注册一个群聊消息处理
bot.onMessage('group', async (ctx) => {
    bot.info('收到群聊消息：', ctx.raw_message)
});

// 注册一个群聊[匿名]消息处理
bot.onMessage('group', async (ctx) => {
    bot.info('收到群聊匿名消息：', ctx.raw_message)
}, { where: 'anonymous' });

// 注册一个notice事件处理，如戳一戳
// notice.private.common
bot.onNotice('private', async (ctx) => {
    bot.info(ctx.sender_id, '敢戳我？真牛');
});

// 注册元事件中的heartbeat事件处理
bot.onMetaEvent('heartbeat', async (ctx) => {
    bot.info(ctx.msg.status, '接收到一个心跳');
});

```

**pure-bot 完整的事件树**

详情可以查看[onebot](https://github.com/howmanybots/onebot/blob/master/v11/specs/README.md)的文档

```javascript
bot.events = {
    message: {
        common: '所有消息事件',
        private: {
            common: '所有私聊消息事件',
            friend: '来自好友的私聊消息',
            group: '来自群的私聊消息（临时会话）',
            other: '其它'
        },
        group: {
            common: '所有群聊消息事件',
            normal: '正常群聊消息',
            anonymous: '群匿名消息',
            notice: '群系统提示'
        }
    },
    notice: {
        common: '所有通知事件',
        private: {
            common: '所有个人通知事件',
            friend_add: '好友添加',
            friend_recall: '好友撤回消息',
            notify: {
                common: 'notify事件（龙王、红包运气王、荣誉）',
                poke: '龙王',
                lucky_king: '红包运气王',
                honor: '荣誉',
            }
        },
        group: {
            common: '所有的群通知事件',
            group_upload: '群文件上传',
            group_admin: {
                common: '管理员设置/取消事件',
                set: '管理员添加',
                unset: '管理员取消',
            },
            group_decrease: {
                common: '群成员减少',
                leave: '退群',
                kick: '被踢',
                kick_me: '机器人被踢',
            },
            group_increase: {
                common: '群成员增加',
                approve: '管理员同意入群',
                invite: '经邀请入群',
            },
            group_ban: {
                common: '群禁言',
                ban: '禁言',
                lift_ban: '解除禁言',
            },
            group_recall: '群消息撤回事件',
            notify: {
                common: '群内notify事件（龙王、红包运气王、荣誉）',
                poke: '龙王',
                lucky_king: '红包运气王',
                honor: '荣誉',
            }
        }
    },
    request: {
        common: '所有的请求事件',
        friend: '好友请求',
        group: {
            common: '群请求',
            add: '加群请求',
            invite: 'bot收到入群邀请',
        }
    },
    meta_event: {
        common: '所有元事件',
        lifecycle: {
            common: '所有生命周期',
            connect: '连接到ws服务器',
            enable: 'onebot启用',
            disable: 'onebot禁用',
        },
        heartbeat: '心跳事件',
    }
};
```

### 全局事件拦截器

可以在任何事件执行前启动拦截器进行检查，如果拦截器拒绝，事件将不会执行。

**注册拦截器**

注册方法

- handler支持异步或同步方法，将会接收一个MessageContext。
- name是拦截器的名称，需要唯一。

```javascript
bot.addBeforeChecker(name, handler)
```

示例

```javascript
// 全局事件执行前检查器，名称需要唯一
// return false 将阻止事件执行
// 并且，ckecker是顺序执行的，我们在下面注册了test1，但是test1不会触发，因为在test执行时，事件已经结束
bot.addBeforeChecker('test', async (ctx) => {
    bot.info('check: test');
    // 如果事件为心跳，则不处理
    if (ctx.msg.meta_event_type === 'heartbeat') {
        bot.info('心跳？不熟，真不熟')
        return false;
    }
});

bot.addBeforeChecker('test1', async (ctx) => {
    bot.info('check: test1');
    // 如果事件为心跳，则不处理
    if (ctx.msg.meta_event_type === 'heartbeat') {
        bot.info('1 心跳？不熟，真不熟')
        return false;
    }
});
```

**移除拦截器**

输入拦截器的名称即可移除。

```javascript
bot.removeBeforeChecker('test')
bot.removeBeforeChecker('test1')
```

## 全局事件拦截器：执行后钩子

将在事件完成执行后执行，参数与全局拦截器一致。

**注册拦截器**

注册方法

```javascript
bot.addAfterHandler(name, handler)
```

示例

```javascript

bot.addAfterHandler('test', async (ctx) => {
    bot.info('刚才机器人完成了来自qq: ', ctx.sender_id, '的事件处理。')
});
```

**移除拦截器**

输入拦截器的名称即可移除。

```javascript
bot.removeBeforeChecker('test')
```

### 错误处理

**使用async**

```javascript
bot.onMessage('private', async (ctx) => {
    // 使用try catch
    try {
        await ctx.fastReply('hello, world');
    } catch (err) {
        // 使用bot内置logger打印错误。
        bot.error(err);
    }
});
```

**常规**

```javascript
bot.onMessage('private', (ctx) => {
    ctx.fastReply('hello, world').then((res) => {
        // 处理...
    }).catch((err) => {
        // 处理
    })
});

```

- 如你所见，pure-bot大多数回调方法同时支持 `AsyncFunction` 和 `Function`，可自由安排。

## 日志

bot中默认内置了四种日志打印，具有不同的样式。

```javascript
bot.log('hi', 'hello', { obj: '直接传参数' })
bot.info('hi')
bot.warn('hi')
bot.error('hi')
```

## 同时启动多个bot实例

如果需要使用多个qq号，可能得在cqhttp进行配置，开启多个服务

index.js

```javascript
const { QQbot } = require('pure-bot');

const bot1 = new QQbot({
    name: '阿猫',
    serverOptions: {
        port: 8080 // 不同qq号使用不同端口
    }
});

const bot2 = new QQbot({
    name: '阿狗',
    serverOptions: {
        port: 8089 // 不同qq号使用不同端口
    }
});

const bot3 = new QQbot({
    name: '阿猫2',
    serverOptions: {
        port: 8080 // 相同qq号，但需要建立多个bot实例可以使用相同端口
    }
});

// 继续注册事件即可
bot1.on('private', async (ctx) => { ... })
bot2.on('private', async (ctx) => { ... })
bot3.on('group', (ctx) => { ... })
```

## 帮助开发

**克隆项目并安装依赖**

```
git clone https://github.com/Pure-Peace/pure-bot
```

```
npm i
```

**直接运行**

```
npm run go
```

运行内置示例来方便开发调试pure-bot这个项目，内置bot示例位于项目`example`目录。

运行后将会启动一个机器人，会尝试连接cqhttp的反向ws服务器。

进行任何代码修改程序将自动重启，
若修改pure-bot的源代码，会自动重新编译typescript，然后重启。

## MIT

Pure-Peace
