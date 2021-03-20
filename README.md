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

config.hjson

```javascript
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
const { onebot: { QQbot } } = require('pure-bot');

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
// ctx是消息上下文MessageContext
bot.onMessage('private', async (ctx) => {
    // bot收到你的消息后将会进行回复。
    // 执行api（如fastReply）将统一返回promise
    await ctx.fastReply('hello, world')
});
```

- **[> 完整示例可查看此处 <](https://github.com/Pure-Peace/pure-bot/blob/main/example/index.js)**

### 事件注册

支持 [onebot](https://github.com/howmanybots/onebot/blob/master/v11/specs/README.md) 协议制定的事件，共四种：

- [消息事件 (message)](https://github.com/howmanybots/onebot/blob/master/v11/specs/event/message.md)
  
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

- 参数 **type**：**每种事件有不同的类型，common代表所有类型。**
- 参数 **handler**：**处理方法**，可传入异步方法(`AsyncFunction`)，也可传入普通方法，处理方法需要接收一个**上下文**(`MessageContext`)作为参数。
- 参数 **options**：**处理选项**，可定义过滤器 `filters`，也可以添加钩子（执行前处理函数、执行后处理函数）。

**关于上下文 `MessageContext` （ctx）的内容，可以查看源代码文件：[context.ts](https://github.com/Pure-Peace/pure-bot/blob/main/src/context.ts)**，或者[点这里看](https://github.com/Pure-Peace/pure-bot#%E6%9B%B4%E5%A4%9A%E7%9A%84api)
**关于 `options` 东西有点多，请直接查看下面的完整示例，有注释。**

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

### 更多的API

如何调用CQAPI，或者说，onebot API。

在大多数处理程序（handler）中，上下文都会被作为参数传入。通过上下文的`client`对象，我们可以进行CQAPI的调用。

关于上下文 `MessageContext` （ctx）的内容，可以查看源代码文件：[context.ts](https://github.com/Pure-Peace/pure-bot/blob/main/src/context.ts)。

**调用示例**

此处演示调用一个 `getTargetGroupInfo` 方法获取目标群聊的信息。

```javascript
// 注册一个群聊消息处理
bot.onMessage('group', async (ctx) => {
    // 使用ctx.client 调用 CQ Api
    // 这是获取群聊信息
    try {
        const result = await ctx.client.getTargetGroupInfo({ group_id: ctx.group_id });
        bot.info('成功获取群聊消息：', result);
    } catch (err) {
        bot.error('获取群聊信息失败，错误：', err);
    }
});
```

全部的API一般可参见[cqhttp的文档](https://docs.go-cqhttp.org/api/)，但实际上不太需要，**我写了注释**。

- 在README底部可以看到：[全部的API](https://github.com/Pure-Peace/pure-bot#%E5%85%A8%E9%83%A8%E7%9A%84API)

- 或者直接查看[源代码 cq_api.ts](https://github.com/Pure-Peace/pure-bot/blob/main/src/cq_api.ts)

**调用时如图：**
![效果1](http://miya.ink/samp1.png)

**也可以查看详细的：**

![效果2](http://miya.ink/samp2.png)

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
const { onebot: { QQbot } } = require('pure-bot');

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

## 全部的API

一般可在`ctx.client`处调用，
如果有未支持的API，可调用`ctx.ws`手动发送消息，或者提交PR。

[cq_api.ts](https://github.com/Pure-Peace/pure-bot/blob/main/src/cq_api.ts)

```javascript
/**
 * 发送消息 / send_msg
 * @param {number} user_id - 目标QQ号 The target QQ number
 * @param {number} group_id - 目标群号 The target QQ group number
 * @param {string} message - content
 * @param {boolean} auto_escape - 不解析消息内容 send as plain text
 */
sendMsg (params: { user_id: number, group_id: number, message: any, auto_escape: boolean }, timeout: number = undefined) {
    return this.apiCall('send_msg', params, timeout);
}

/**
 * 发送私聊消息 / send_private_msg
 * @param {number} user_id - 目标QQ号 The target QQ number
 * @param {number} group_id - 主动发起临时会话群号
 * @param {string} message - content
 * @param {boolean} auto_escape - 不解析消息内容 send as plain text
 */
sendPrivateMsg (params: { user_id: number, group_id: number, message: any, auto_escape: boolean }, timeout: number = undefined) {
    return this.apiCall('send_private_msg', params, timeout);
}

/**
 * 发送群消息 / send_group_msg
 * @param {number} group_id - 目标群号 The target QQ group number
 * @param {number} message - content
 * @param {boolean} auto_escape - 不解析消息内容 send as plain text
 */
sendGroupMsg (params: { group_id: number, message: any, auto_escape: boolean }, timeout: number = undefined) {
    return this.apiCall('send_group_msg', params, timeout);
}

/**
 * 合并转发消息节点 / send_group_forward_msg
 * @param {number} group_id - 目标群号 The target QQ group number
 * @param {array} messages - CQnode, Doc: https://docs.go-cqhttp.org/cqcode/#合并转发消息节点
 */
sendGroupForwardMsg (params = {
    group_id: undefined,
    messages: [
        {
            type: 'node',
            data: {
                name: '消息发送者A',
                uin: '10086',
                content: [
                    {
                        type: 'text',
                        data: { text: '测试消息1' }
                    }
                ]
            }
        },
        {
            type: 'node',
            data: {
                name: '消息发送者B',
                uin: '10087',
                content: '666'
            }
        }
    ]
}, timeout: number = undefined) {
    return this.apiCall('send_group_forward_msg', params, timeout);
}

/**
 * 撤回消息 / delete_msg
 * @param {number} message_id - 消息id The message id
 */
deleteMsg (params: { message_id: number } = { message_id: undefined }, timeout: number = undefined) {
    return this.apiCall('delete_msg', params, timeout);
}

/**
 * 获取消息 / get_msg
 * @param {number} message_id - 消息id The message id
 */
getMsg (params = {
    message_id: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_msg', params, timeout);
}

/**
 * 获取合并转发消息 / get_forward_msg
 * @param {number} message_id - 消息id The message id
 */
getForwardMsg (params: { message_id: number } = {
    message_id: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_forward_msg', params, timeout);
}

/**
 * 获取图片信息 / get_image
 * @param {string} file - 图片缓存文件名 File cache name (CQ)
 */
getImage (params: { file: string } = {
    file: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_image', params, timeout);
}

/**
 * QQ群踢人 / set_group_kick
 * @param {number} group_id - QQ Group number
 * @param {number} user_id - Target user QQ number
 * @param {boolean} reject_add_request - 拒绝此人的加群请求
 */
groupKick (params: { group_id: number, user_id: number, reject_add_request: boolean } = {
    group_id: undefined,
    user_id: undefined,
    reject_add_request: false
}, timeout: number = undefined) {
    return this.apiCall('set_group_kick', params, timeout);
}

/**
 * QQ群禁言 / set_group_ban
 * @param {number} group_id - QQ Group number
 * @param {number} user_id - Target user QQ number
 * @param {number} duration - 禁言时长, 单位秒, 0 表示取消禁言
 */
groupBan (params: {
    group_id: number,
    user_id: number,
    duration: 300
} = {
    group_id: undefined,
    user_id: undefined,
    duration: 300
}, timeout: number = undefined) {
    return this.apiCall('set_group_ban', params, timeout);
}

/**
 * QQ群禁言匿名用户 / set_group_anonymous_ban
 * @param {number} group_id - QQ Group number
 * @param {object} anonymous - Target anonymous object (from message)
 * @param {string} anonymous_flag - Target anonymous flag (from message)
 * @param {number} duration - 禁言时长, 单位秒, 无法取消
 */
groupBanAnonymous (params: {
    group_id: number,
    anonymous: object,
    anonymous_flag: string,
    duration: number
} = {
    group_id: undefined,
    anonymous: undefined,
    anonymous_flag: undefined,
    duration: 300
}, timeout: number = undefined) {
    return this.apiCall('set_group_anonymous_ban', params, timeout);
}

/**
 * QQ群全体禁言 / set_group_whole_ban
 * @param {number} group_id - QQ Group number
 * @param {boolean} enable - 是否开启
 */
groupBanAll (params: {
    group_id: number,
    enable: boolean
} = {
    group_id: undefined,
    enable: true
}, timeout: number = undefined) {
    return this.apiCall('set_group_whole_ban', params, timeout);
}

/**
 * QQ群设置管理员 / set_group_admin
 * @param {number} group_id - QQ Group number
 * @param {number} user_id - Target user QQ number
 * @param {boolean} enable - 是否设为管理员
 */
setGroupAdmin (params: {
    group_id: number,
    user_id: number,
    enable: boolean
} = {
    group_id: undefined,
    user_id: undefined,
    enable: true
}, timeout: number = undefined) {
    return this.apiCall('set_group_admin', params, timeout);
}

/**
 * QQ群设置匿名聊天 / set_group_anonymous
 * @param {number} group_id - QQ Group number
 * @param {boolean} enable - 是否设为管理员
 */
setGroupAnonymous (params: {
    group_id: undefined,
    enable: boolean
} = {
    group_id: undefined,
    enable: true
}, timeout: number = undefined) {
    this.bot.error('Unimplement: set_group_anonymous');
    return this.apiCall('set_group_anonymous', params, timeout);
}

/**
 * QQ群设置用户群名片 / set_group_card
 * @param {number} group_id - QQ Group number
 * @param {number} user_id - Target user QQ number
 * @param {string} card - 群名片内容，为空将删除
 */
setGroupCard (params: {
    group_id: number,
    user_id: number,
    card: string
} = {
    group_id: undefined,
    user_id: undefined,
    card: ''
}, timeout: number = undefined) {
    return this.apiCall('set_group_card', params, timeout);
}

/**
 * QQ群设置群名 / set_group_name
 * @param {number} group_id - QQ Group number
 * @param {string} group_name - New group name
 */
setGroupName (params: {
    group_id: number,
    group_name: string
} = {
    group_id: undefined,
    group_name: undefined
}, timeout: number = undefined) {
    return this.apiCall('set_group_name', params, timeout);
}

/**
 * QQ群退群或解散 / set_group_leave
 * @param {number} group_id - QQ Group number
 * @param {boolean} is_dismiss - 是否解散 （仅群主可用）
 */
groupLeave (params: {
    group_id: number,
    is_dismiss: boolean
} = {
    group_id: undefined,
    is_dismiss: false
}, timeout: number = undefined) {
    return this.apiCall('set_group_leave', params, timeout);
}

/**
 * QQ群设置用户专属头衔 / set_group_special_title
 * @param {number} group_id - QQ Group number
 * @param {number} user_id - Target user QQ number
 * @param {string} special_title - Title 头衔，为空将删除
 * @param {number} duration - 持续时间，可能无效
 */
groupSetUserTitle (params: {
    group_id: number,
    user_id: number,
    special_title: string,
    duration: number
} = {
    group_id: undefined,
    user_id: undefined,
    special_title: undefined,
    duration: -1
}, timeout: number = undefined) {
    return this.apiCall('set_group_special_title', params, timeout);
}

/**
 * 处理好友请求 / set_friend_add_request
 * @param {string} flag - From message
 * @param {boolean} approve - 同意或拒绝
 * @param {string} remark - 备注
 */
friendAddHandle (params: {
    flag: string,
    approve: boolean,
    remark: string
} = {
    flag: undefined,
    approve: true,
    remark: ''
}, timeout: number = undefined) {
    return this.apiCall('set_friend_add_request', params, timeout);
}

/**
 * 处理加群请求 / set_group_add_request
 * @param {string} flag - From message
 * @param {string} sub_type - 'add' or 'invite' (From message)
 * @param {boolean} approve - 同意或拒绝
 * @param {string} reason - 拒绝理由
 */
groupAddHandle (params: {
    flag: string,
    sub_type: string,
    approve: boolean,
    reason: string
} = {
    flag: undefined,
    sub_type: undefined,
    approve: true,
    reason: ''
}, timeout: number = undefined) {
    return this.apiCall('set_group_add_request', params, timeout);
}

/**
 * 获取登录QQ号信息 / get_login_info
 */
getLoginInfo (params = {}, timeout: number = undefined) {
    return this.apiCall('get_login_info', params, timeout);
}

/**
 * 获取好友列表 / get_friend_list
 */
getFriendList (params = {}, timeout: number = undefined) {
    return this.apiCall('get_friend_list', params, timeout);
}

/**
 * 获取QQ群列表 / get_group_list
 */
getGroupList (params = {}, timeout: number = undefined) {
    return this.apiCall('get_group_list', params, timeout);
}

/**
 * 获取指定QQ号信息 / get_stranger_info
 * @param {number} user_id - QQ number
 * @param {boolean} no_cache - 不使用缓存
 */
getTargetQQInfo (params: {
    user_id: number,
    no_cache: boolean
} = {
    user_id: undefined,
    no_cache: false
}, timeout: number = undefined) {
    return this.apiCall('get_stranger_info', params, timeout);
}

/**
 * 获取指定QQ群信息 / get_group_info
 * @param {number} group_id - QQ group number
 * @param {boolean} no_cache - 不使用缓存
 */
getTargetGroupInfo (params: {
    group_id: number,
    no_cache: boolean
} = {
    group_id: undefined,
    no_cache: false
}, timeout: number = undefined) {
    return this.apiCall('get_group_info', params, timeout);
}

/**
 * 获取指定群成员信息 / get_group_member_info
 * @param {number} group_id - QQ group number
 * @param {number} user_id - QQ number
 * @param {boolean} no_cache - 不使用缓存
 */
getGroupMemberInfo (params: {
    group_id: number,
    user_id: number,
    no_cache: boolean
} = {
    group_id: undefined,
    user_id: undefined,
    no_cache: false
}, timeout: number = undefined) {
    return this.apiCall('get_group_member_info', params, timeout);
}

/**
 * 获取群成员列表 / get_group_member_list
 * @param {number} group_id - QQ group number
 */
getGroupMemberList (params: {
    group_id: number
} = {
    group_id: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_group_member_list', params, timeout);
}

/**
 * 获取群荣誉信息 / get_group_honor_info
 * @param {number} group_id - QQ group number
 * @param {string} type - input: talkative / performer / legend / strong_newbie / emotion / all
 */
getGroupHonorInfo (params: {
    group_id: number,
    type: string
} = {
    group_id: undefined,
    type: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_group_honor_info', params, timeout);
}

/**
 * 获取Cookies / get_cookies
 * @param {string} domain - Target domain
 */
getCookies (params: { domain: string } = {
    domain: undefined
}, timeout: number = undefined) {
    this.bot.error('Unimplement: get_cookies');
    return this.apiCall('get_cookies', params, timeout);
}

/**
 * 获取CsrfToken / get_csrf_token
 */
getCsrfToken (params = {}, timeout: number = undefined) {
    this.bot.error('Unimplement: get_csrf_token');
    return this.apiCall('get_csrf_token', params, timeout);
}

/**
 * 获取Credentials凭证 / get_credentials
 */
getCredentials (params = {}, timeout: number = undefined) {
    this.bot.error('Unimplement: get_credentials');
    return this.apiCall('get_credentials', params, timeout);
}

/**
 * 获取语音 / get_record
 * @param {string} file - 消息段的 file 参数, 如 0B38145AA44505000B38145AA4450500.silk
 * @param {string} out_format - input: mp3 / amr / wma / m4a / spx / ogg / wav / flac
 */
getRecord (params: { file: string, out_format: string } = { file: undefined, out_format: 'mp3' }, timeout: number = undefined) {
    this.bot.error('Unimplement: get_record');
    return this.apiCall('get_record', params, timeout);
}

/**
 * 检查是否可以发送图片 / can_send_image
 */
checkCanSendImage (params = {}, timeout: number = undefined) {
    return this.apiCall('can_send_image', params, timeout);
}

/**
 * 检查是否可以发送语音 / can_send_record
 */
checkCanSendRecord (params = {}, timeout: number = undefined) {
    return this.apiCall('can_send_record', params, timeout);
}

/**
 * 获取版本信息 / get_version_info
 */
getVersionInfo (params = {}, timeout: number = undefined) {
    return this.apiCall('get_version_info', params, timeout);
}

/**
 * 重启 go-cqhttp / set_restart
 * @param {number} delay - 延迟 Delay ms
 */
restartCQ (params = { delay: 0 }, timeout: number = undefined) {
    return this.apiCall('set_restart', params, timeout);
}

/**
 * 清理缓存 / clean_cache
 */
cleanCache (params = {}, timeout: number = undefined) {
    this.bot.error('Unimplement: clean_cache');
    return this.apiCall('clean_cache', params, timeout);
}

/**
 * 设置群头像 / set_group_portrait
 * @param {number} group_id - QQ group number
 * @param {string} file - image path: file:///C:\\xx\xx.png / http://xxx/xx.jpg / base64://xxxx==
 * @param {number} cache - 是否使用已缓存的文件 0 / 1
 */
setGroupImage (params: {
    group_id: number,
    file: string,
    cache: number
} = {
    group_id: undefined,
    file: undefined,
    cache: 1
}, timeout = 10000) {
    return this.apiCall('set_group_portrait', params, timeout);
}

/**
 * 获取中文分词 ( 隐藏 API ) / .get_word_slices
 * @param {string} content - content
 */
getWordSlices (params: { content: string } = { content: undefined }, timeout: number = undefined) {
    return this.apiCall('.get_word_slices', params, timeout);
}

/**
 * 图片 OCR / ocr_image
 * @param {string} image - 图片id
 */
ocrImage (params: { image: string } = { image: undefined }, timeout = 10000) {
    return this.apiCall('ocr_image', params, timeout);
}

/**
 * 获取群系统消息 / get_group_system_msg
 */
getGroupSystemMsg (params = {}, timeout: number = undefined) {
    return this.apiCall('get_group_system_msg', params, timeout);
}

/**
 * 上传群文件 / upload_group_file
 * @param {number} group_id - QQ group number
 * @param {string} file - local image path: file:///C:\\xx\xx.png
 * @param {string} name - 储存名称
 * @param {string} folder - 父目录ID
 */
groupUploadFile (params: {
    group_id: number,
    file: string,
    name: string,
    folder: string
} = {
    group_id: undefined,
    file: undefined,
    name: undefined,
    folder: undefined
}, timeout = 20000) {
    return this.apiCall('upload_group_file', params, timeout);
}

/**
 * 获取群文件信息 / get_group_file_system_info
 * @param {number} group_id - QQ group number
 */
getGroupFileInfo (params: {
    group_id: number
} = {
    group_id: undefined
}, timeout = 10000) {
    return this.apiCall('get_group_file_system_info', params, timeout);
}

/**
 * 获取群根目录文件列表 / get_group_root_files
 * @param {number} group_id - QQ group number
 */
getGroupRootFileList (params: {
    group_id: number
} = {
    group_id: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_group_root_files', params, timeout);
}

/**
 * 获取群子目录文件列表 / get_group_files_by_folder
 * @param {number} group_id - QQ group number
 * @param {number} folder_id - 文件夹ID
 */
getGroupFilesByFolder (params: {
    group_id: number,
    folder_id: number
} = {
    group_id: undefined,
    folder_id: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_group_files_by_folder', params, timeout);
}

/**
 * 获取群文件资源链接 / get_group_file_url
 * @param {number} group_id - QQ group number
 * @param {number} file_id - 文件ID
 * @param {number} busid - File type
 */
getGroupFileUrl (params: {
    group_id: number,
    file_id: number,
    busid: number
} = {
    group_id: undefined,
    file_id: undefined,
    busid: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_group_file_url', params, timeout);
}

/**
 * 获取CQ状态 / get_status
 */
getCqStatus (params = {}, timeout: number = undefined) {
    return this.apiCall('get_status', params, timeout);
}

/**
 * 获取群 @ 全体成员 剩余次数 / get_group_at_all_remain
 * @param {number} group_id - QQ group number
 */
getGroupAtAllRemain (params: {
    group_id: number
} = {
    group_id: undefined
}, timeout: number = undefined) {
    return this.apiCall('get_group_at_all_remain', params, timeout);
}

/**
 * 对事件执行快速操作 ( 隐藏 API ) / .handle_quick_operation
 * @param {object} context - 事件数据对象
 * @param {object} context - 快速操作对象, 例如 {"ban": true, "reply": "请不要说脏话"}
 * @doc 文档 https://docs.go-cqhttp.org/event/#快速操作
 */
quckHandle (params:
    {
        context: object,
        operation: object,
    } = {
    context: undefined,
    operation: undefined
}, timeout: number = undefined) {
    return this.apiCall('.handle_quick_operation', params, timeout);
}

/**
 * 获取Vip状态 / _get_vip_info
 * @param {number} user_id - Target QQ number
 */
getQQvipInfo (params: { user_id: number } = { user_id: undefined }, timeout: number = undefined) {
    return this.apiCall('_get_vip_info', params, timeout);
}

/**
 * 发送群公告 / _send_group_notice
 * @param {number} group_id - Target QQ group number
 * @param {string} content - content
 */
groupSendNotice (params: { group_id: number, content: string } = { group_id: undefined, content: undefined }, timeout: number = undefined) {
    return this.apiCall('_send_group_notice', params, timeout);
}

/**
 * 重载事件过滤器 / reload_event_filter
 */
reloadEventFilter (params = {}, timeout: number = undefined) {
    return this.apiCall('reload_event_filter', params, timeout);
}

/**
 * 下载文件到缓存目录 / download_file
 * @param {string} url - download url
 * @param {string} thread_count - 下载线程数
 * @param {array} headers - 自定义请求头
 *  [
 *      "User-Agent=YOUR_UA",
 *      "Referer=https://www.baidu.com"
 *  ]
 */
downloadFile (
    params: { url: string, thread_count: string, headers: Array<string> } =
    { url: undefined, thread_count: undefined, headers: [] },
    timeout: number = undefined) {
    return this.apiCall('download_file', params, timeout);
}

/**
 * 获取当前账号在线客户端列表 / get_online_clients
 * @param {boolean} no_cache - 是否无视缓存
 */
getOnlineClients (params: { no_cache: boolean } = { no_cache: undefined }, timeout: number = undefined) {
    return this.apiCall('get_online_clients', params, timeout);
}

/**
 * 获取群消息历史记录 / get_group_msg_history
 * @param {number} message_seq - 起始消息序号, 可通过 get_msg 获得
 * @param {number} group_id - 群号
 */
groupGetMsgHistory (params: { message_seq: number, group_id: number } = { message_seq: undefined, group_id: undefined }, timeout: number = undefined) {
    return this.apiCall('get_group_msg_history', params, timeout);
}

/**
 * 设置精华消息 / set_essence_msg
 * @param {number} message_id - msg id
 */
setEssenceMsg (params: { message_id: number } = { message_id: undefined }, timeout: number = undefined) {
    return this.apiCall('set_essence_msg', params, timeout);
}

/**
 * 移出精华消息 / delete_essence_msg
 * @param {number} message_id - msg id
 */
deleteEssenceMsg (params: { message_id: number } = { message_id: undefined }, timeout: number = undefined) {
    return this.apiCall('delete_essence_msg', params, timeout);
}

/**
 * 获取精华消息列表 / get_essence_msg_list
 * @param {number} group_id - QQ group id
 */
getEssenceMsgList (params: { message_id: number } = { message_id: undefined }, timeout: number = undefined) {
    return this.apiCall('get_essence_msg_list', params, timeout);
}

/**
 * 检查链接安全性 / check_url_safely
 * @param {string} url - url
 */
checkUrlSafely (params: { url: string } = { url: undefined }, timeout: number = undefined) {
    return this.apiCall('check_url_safely', params, timeout);
}
```

## MIT

Pure-Peace

### 特别感谢

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars.githubusercontent.com/u/10007589?&v=4" width="100px;" alt="arily"/><br /><sub><b>arily（阿日）</b></sub>](https://github.com/arily)<br /> |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->