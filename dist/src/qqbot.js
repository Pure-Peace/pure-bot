'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.QQbot = void 0;
const WebSocket = require("ws");
const events_1 = require("events");
const chalk = require("chalk");
const dayjs = require("dayjs");
const context_1 = require("./context");
const utils_1 = require("./utils");
const parse = require('fast-json-parse');
const stringify = require('fast-json-stable-stringify');
const createChain = require('chain-of-responsibility');
class QQbot {
    constructor({ name, logName, logUnhandledInfo, logHeartbeat, debug, serverOptions = { port: 8080, deactive_timeout: 5000 }, eventAssigns = {}, customGlobalFilters = {}, loggerOptions = {}, beforeHandleCheckers = {}, afterHandlers = {}, initEventsMethod = (bot) => { } }) {
        this.eventHandlers = {
            message: async (ctx) => {
                const msg = ctx.msg;
                const time = new utils_1.Duration();
                const level1 = this.events.message;
                const level2 = level1[msg.message_type];
                const level3 = level2[msg.sub_type];
                const taskList = [...level1.common, ...level2.common, ...level3];
                const tipString = `${chalk.yellow(msg.message_type)}.${chalk.yellow(msg.sub_type || '.')}`;
                this.fastEventHandler({
                    taskList, tipString, time, ctx, type: 'message'
                });
            },
            notice: async (ctx) => {
                const msg = ctx.msg;
                const time = new utils_1.Duration();
                let taskList;
                if (['friend_add', 'friend_recall'].includes(msg.notice_type)) {
                    msg.custom_type = 'private';
                }
                else if (!msg.group_id) {
                    msg.custom_type = 'private';
                }
                else {
                    msg.custom_type = 'group';
                }
                const level1 = this.events.notice;
                const level2 = level1[msg.custom_type];
                const level3 = level2[msg.notice_type];
                const level4 = level3[msg.sub_type];
                if (level3.constructor === Array) {
                    taskList = [...level1.common, ...level2.common, ...level3];
                }
                else {
                    taskList = [...level1.common, ...level2.common, ...level3.common, ...level4];
                }
                const tipString = `${chalk.yellow(msg.custom_type)}.${chalk.yellow(msg.notice_type + '.' + msg.sub_type || '.')}`;
                this.fastEventHandler({
                    taskList, tipString, time, ctx, type: 'notice'
                });
            },
            request: async (ctx) => {
                const msg = ctx.msg;
                const time = new utils_1.Duration();
                let taskList;
                const level1 = this.events.request;
                const level2 = level1[msg.request_type];
                const level3 = level2[msg.sub_type];
                if (level2.constructor === Array) {
                    taskList = [...level1.common, ...level2];
                }
                else {
                    taskList = [...level1.common, ...level2.common, ...level3];
                }
                const tipString = `${chalk.yellow(msg.request_type)}.${chalk.yellow(msg.sub_type || '.')}`;
                this.fastEventHandler({
                    taskList, tipString, time, ctx, type: 'request'
                });
            },
            meta_event: async (ctx) => {
                const msg = ctx.msg;
                const time = new utils_1.Duration();
                let taskList;
                const level1 = this.events.meta_event;
                const level2 = level1[msg.meta_event_type];
                const level3 = level2[msg.sub_type];
                if (level2.constructor === Array) {
                    taskList = [...level1.common, ...level2];
                }
                else {
                    taskList = [...level1.common, ...level2.common, ...level3];
                }
                const tipString = `${chalk.yellow(msg.meta_event_type)}.${chalk.yellow(msg.sub_type || '.')}`;
                this.fastEventHandler({
                    taskList, tipString, time, ctx, type: 'meta_event'
                });
            }
        };
        this.defaultHandleOptions = () => { return { where: '', filters: this.globalFilters, beforeChecker: undefined, afterHandler: undefined }; };
        this.defaultFilters = { prefixes: [], regexs: [], keywords: [], include_qq: [], include_group: [], exclude_qq: [], exclude_group: [] };
        this.id = '?';
        this.name = name ?? 'default';
        this.logName = logName ?? 'QQBot';
        this.connected = false;
        this.debug = debug ?? true;
        this.logUnhandledInfo = logUnhandledInfo ?? true;
        this.logHeartbeat = logHeartbeat ?? true;
        this.eventEmitter = new events_1.EventEmitter();
        this.globalFilters = Object.assign(this.defaultFilters, customGlobalFilters ?? {});
        this.totalSend = 0;
        this.totalRecive = 0;
        this.lastRecived = -1;
        this.status = {};
        this.initEventsMethod = initEventsMethod ?? ((bot) => { });
        this.events = this.defaultEvents(eventAssigns);
        this.beforeHandleCheckers = beforeHandleCheckers ?? {};
        this.afterHandlers = afterHandlers ?? {};
        this.loggerize(loggerOptions);
        this.initEventsMethod(this);
        this.initServer(serverOptions);
        this.plugins = new Map();
    }
    initServer(options) {
        this.server = new WebSocket.Server(options);
        this.info(chalk.yellowBright(`started, waiting for ws connect... (port: ${options.port})`));
        this.server.on('connection', async (ws) => {
            ws.sendJson = (data) => {
                ws.send(stringify(data));
            };
            ws.heartBeat = () => {
                clearTimeout(ws.pingTimeout);
                ws.pingTimeout = setTimeout(() => {
                    this.info(`${options.port} connect timeout, terminate.`);
                    ws.alive = false;
                    ws.terminate();
                }, options.deactive_timeout || 30000);
            };
            ws.heartBeat();
            ws.on('message', (msg) => this.handleMessage(msg, ws));
        });
    }
    fastAddEventHandler(typeCheckIn, eventType, type, handler, options) {
        let { where, filters, beforeChecker, afterHandler } = Object.assign(this.defaultHandleOptions(), options);
        const handlerTask = { handler, filters, beforeChecker, afterHandler };
        let extraTypes = '';
        const handlerChalked = `${chalk.yellowBright(eventType)}`;
        const success = () => this.info(`success to add handler: ${handlerChalked}.${chalk.green(type + '.' + (where || 'common'))}`);
        const e = this.events[eventType];
        if (!typeCheckIn.includes(type)) {
            this.error(`error when add handler, invalid '${handlerChalked}' type '${chalk.red(type)}', should be in [${chalk.yellowBright(typeCheckIn)}]`);
            return;
        }
        if (type === 'common') {
            e.common.push(handlerTask);
            success();
            return;
        }
        if (!where) {
            if (e[type].constructor === Array)
                e[type].push(handlerTask);
            else
                e[type].common.push(handlerTask);
            success();
            return;
        }
        if (eventType === 'notice') {
            const [level1, level2] = where.split('.');
            if (!(level1 in e[type])) {
                this.error(`error when add handler, 'where' of '${handlerChalked}' type '${type}' must in [${Object.keys(e[type])}], got '${level1}' (full 'where': ${where}).`);
                return;
            }
            const obj = e[type][level1];
            if (obj.constructor === Array) {
                obj.push(handlerTask);
                success();
                return;
            }
            if (!level2) {
                where = 'common';
                obj[where].push(handlerTask);
                success();
                return;
            }
            extraTypes = ' or ' + chalk.yellowBright(`notify.[${Object.keys(obj)}]`);
            if (level2 in obj) {
                obj[level2].push(handlerTask);
                success();
                return;
            }
        }
        else {
            if (where in e[type]) {
                e[type][where].push(handlerTask);
                success();
                return;
            }
        }
        this.error(`error when add handler, 'where' of '${handlerChalked}' type '${type}' must in [${Object.keys(e[type])}]${extraTypes || ''}, got '${where}'.`);
    }
    onMessage(type, handler, options = {}) {
        this.fastAddEventHandler(['common', 'private', 'group'], 'message', type, handler, options);
    }
    onNotice(type, handler, options = {}) {
        this.fastAddEventHandler(['common', 'private', 'group'], 'notice', type, handler, options);
    }
    onRequest(type, handler, options = {}) {
        this.fastAddEventHandler(['common', 'friend', 'group'], 'request', type, handler, options);
    }
    onMetaEvent(type, handler, options = {}) {
        this.fastAddEventHandler(['common', 'lifecycle', 'heartbeat'], 'meta_event', type, handler, options);
    }
    onLifecycle(lifecycle, handler) {
        const handlerChalked = `${chalk.yellowBright('lifecycle')}`;
        const lifecycles = ['connect', 'enable', 'disable'];
        if (!lifecycles.includes(lifecycle)) {
            this.error(`invalid lifecycle: ${lifecycle}, should be in ${lifecycles.join(', ')}`);
            return;
        }
        this.events.meta_event[lifecycle].push(handler);
        this.info(`success to add ${handlerChalked} handler: ${chalk.green(lifecycle)}`);
    }
    defaultEvents(eventAssigns) {
        const defaultEvents = {
            message: {
                common: [],
                private: {
                    common: [],
                    friend: [],
                    group: [],
                    other: []
                },
                group: {
                    common: [],
                    normal: [],
                    anonymous: [],
                    notice: []
                }
            },
            notice: {
                common: [],
                private: {
                    common: [],
                    friend_add: [],
                    friend_recall: [],
                    notify: {
                        common: [],
                        poke: [],
                        lucky_king: [],
                        honor: []
                    }
                },
                group: {
                    common: [],
                    group_upload: [],
                    group_admin: {
                        common: [],
                        set: [],
                        unset: []
                    },
                    group_decrease: {
                        common: [],
                        leave: [],
                        kick: [],
                        kick_me: []
                    },
                    group_increase: {
                        common: [],
                        approve: [],
                        invite: []
                    },
                    group_ban: {
                        common: [],
                        ban: [],
                        lift_ban: []
                    },
                    group_recall: [],
                    notify: {
                        common: [],
                        poke: [],
                        lucky_king: [],
                        honor: []
                    }
                }
            },
            request: {
                common: [],
                friend: [],
                group: {
                    common: [],
                    add: [],
                    invite: []
                }
            },
            meta_event: {
                common: [],
                lifecycle: {
                    common: [],
                    connect: [
                        async (ctx) => {
                            this.connected = true;
                            ctx.ws.alive = true;
                            this.id = ctx.msg.self_id;
                            this.info(chalk.yellowBright('successfully connected! online now!'));
                        }
                    ],
                    enable: [],
                    disable: []
                },
                heartbeat: [
                    async (ctx) => {
                        this.status = ctx.msg.status;
                    }
                ]
            }
        };
        if (eventAssigns) {
            Object.assign(defaultEvents, eventAssigns);
        }
        return defaultEvents;
    }
    async handleMessage(msg, ws) {
        // update recive
        ws.heartBeat();
        this.totalRecive += 1;
        this.lastRecived = new Date().getTime();
        // parse data
        const parseResult = parse(msg);
        if (parseResult.err) {
            this.error('message parse error:', parseResult.err);
            return;
        }
        msg = parseResult.value;
        // build context
        const ctx = new context_1.MessageContext(msg, ws, this);
        // do before check
        if (!this.beforeHandleCheck(ctx)) {
            return;
        }
        // handle event
        const event = msg.post_type;
        const handler = this.eventHandlers[event];
        if (handler) {
            handler(ctx);
        }
        else if (msg.echo) {
            this.eventEmitter.emit(msg.echo, msg);
            this.info(`recived api call result, id: ${chalk.yellowBright(msg.echo)}; status: ${msg.status};`);
        }
        else {
            this.warn('Unhandled event:', event, '; msg:', msg);
        }
    }
    async fastEventHandler({ taskList, tipString, time, ctx, type }) {
        const isHeartbeat = ctx.msg.meta_event_type === 'heartbeat';
        const condi0 = !isHeartbeat &&
            (this.logUnhandledInfo && (!taskList || taskList.length === 0));
        if ((isHeartbeat && this.logHeartbeat) || condi0) {
            this.warn(`Unhandled ${chalk.yellowBright(type)}.${tipString} message:`, ctx.msg, '; time:', time.elapsed().format());
            return;
        }
        const partLog = (...msg) => this.debug && this.warn(...msg);
        const readyTaskList = [];
        for (const t of taskList) {
            if (t.constructor === Object) {
                if (!t.handler) {
                    this.warn('fastEventHandler: have not handler. message:', ctx.msg);
                    continue;
                }
                // filters
                if (t.filters) {
                    const f = t.filters;
                    const checkIsList = (obj) => {
                        return obj && obj.constructor === Array && obj.length > 0;
                    };
                    // exclude qq
                    if (checkIsList(f.exclude_qq) && f.exclude_qq.includes(ctx.sender_id)) {
                        partLog('filters: exclude qq check blocked.');
                        continue;
                    }
                    // exclude qq group
                    if (checkIsList(f.exclude_group) && f.exclude_group.includes(ctx.group_id)) {
                        partLog('filters: exclude qq group check blocked.');
                        continue;
                    }
                    // include qq
                    if (checkIsList(f.include_qq) && !f.include_qq.includes(ctx.sender_id)) {
                        partLog('filters: include qq check blocked.');
                        continue;
                    }
                    // include qq group
                    if (checkIsList(f.include_group) && !f.include_group.includes(ctx.group_id)) {
                        partLog('filters: include qq group check blocked.');
                        continue;
                    }
                    // prefixes
                    if (checkIsList(f.prefixes) && f.prefixes.filter(prefix => ctx.raw_message.startsWith(prefix)).length === 0) {
                        partLog('filters: prefixes check blocked.');
                        continue;
                    }
                    // include key words
                    if (checkIsList(f.keywords) && f.keywords.filter(keyword => ctx.raw_message.includes(keyword)).length === 0) {
                        partLog('filters: keywords check blocked.');
                        continue;
                    }
                    // regexs
                    if (checkIsList(f.regexs) && f.regexs.filter(regex => regex.test(ctx.raw_message)).length === 0) {
                        partLog('filters: regexs check blocked.');
                        continue;
                    }
                }
                // before checker
                if (t.beforeChecker &&
                    (utils_1.isAsyncFn(t.beforeChecker) ? await t.beforeChecker(ctx) : t.beforeChecker(ctx)) === false) {
                    partLog('fastEventHandler: before checker blocked.');
                    continue;
                }
                // mixin after handler
                if (t.afterHandler) {
                    readyTaskList.push(async (ctx) => {
                        const res = utils_1.isAsyncFn(t.handler) ? await t.handler(ctx) : t.handler(ctx);
                        utils_1.isAsyncFn(t.afterHandler) ? await t.afterHandler(ctx, res) : t.afterHandler(ctx, res);
                    });
                }
                else {
                    readyTaskList.push(t.handler);
                }
            }
            else {
                readyTaskList.push(t);
            }
        }
        Promise.allSettled(readyTaskList.map(handler => handler(ctx))).finally(() => {
            const condi1 = !isHeartbeat &&
                (this.logUnhandledInfo || (!this.logUnhandledInfo && readyTaskList.length !== 0));
            if ((isHeartbeat && this.logHeartbeat) || condi1) {
                const baseInfo = `${readyTaskList.length} ${chalk.yellowBright(type)}.${tipString} handle done in ${time.elapsed().format()}.`;
                let extraInfo = '';
                if (ctx.msg.user_id)
                    extraInfo += `sender: ${ctx.msg.user_id}; `;
                if (ctx.msg.group_id)
                    extraInfo += `group: ${ctx.msg.group_id}; `;
                if (ctx.msg.raw_message)
                    extraInfo += `raw_msg: ${ctx.msg.raw_message.slice(0, 200)};`;
                this.info(baseInfo, extraInfo ? `[${chalk.yellowBright(extraInfo)}]` : '');
            }
            this.afterHandle(ctx);
        });
    }
    async beforeHandleCheck(ctx) {
        for (const checker of Object.values(this.beforeHandleCheckers)) {
            const checkResult = utils_1.isAsyncFn(checker) ? await checker(ctx) : checker(ctx);
            if (checkResult === false) {
                return false;
            }
        }
        return true;
    }
    addBeforeChecker(name, handler) {
        const alreadyExists = this.beforeHandleCheckers[name];
        this.beforeHandleCheckers[name] = handler;
        this.info(`new before checker ${name} ${alreadyExists ? 'rewrited' : 'added'}.`);
    }
    removeBeforeChecker(name) {
        if (this.beforeHandleCheckers[name]) {
            delete (this.beforeHandleCheckers[name]);
            this.info(`before checker ${name} removed.`);
        }
        this.info(`before checker ${name} not exists.`);
    }
    async afterHandle(ctx) {
        const handlers = Object.values(this.afterHandlers);
        if (handlers.length > 0) {
            Promise.allSettled(handlers.map(func => func(ctx, this)));
        }
    }
    addAfterHandler(name, handler) {
        const alreadyExists = this.afterHandlers[name];
        this.afterHandlers[name] = handler;
        this.info(`new after handler ${name} ${alreadyExists ? 'rewrited' : 'added'}.`);
    }
    removeaddAfterHandler(name) {
        if (this.afterHandlers[name]) {
            delete (this.afterHandlers[name]);
            this.info(`after handler ${name} removed.`);
        }
        this.info(`after handler ${name} not exists.`);
    }
    loggerize(options) {
        const _options = {
            info: {
                color: 'green'
            },
            log: {
                color: 'green'
            },
            warn: {
                color: 'yellow'
            },
            error: {
                color: 'red'
            }
        };
        if (options) {
            Object.assign(_options, options);
        }
        for (const [key, op] of Object.entries(_options)) {
            this[key] = (...info) => console[key](this.format({ color: op.color, level: key.toUpperCase() }), ...info);
        }
    }
    format({ color = 'green', level = 'INFO' }) {
        return `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${chalk[color](`[${level}]`)} ${this.logName} <${this.name}(${this.id})>`;
    }
    get clientCount() {
        return this.server.clients.keys.length;
    }
    // shortcuts for message
    onPrivateMessage(handler, ...args) {
        return this.onMessage('private', handler, ...args);
    }
    async initPlugin(plugin, options = {}) {
        // init plugin
        const namespace = await plugin.namespace(options);
        // unmanaged hooks
        Object.entries(plugin.hooks).forEach(([eventName, handler]) => {
            this.info('installing unmanaged hook: ' + eventName);
            if (!this[eventName])
                return this.warn('hook ' + eventName + ' not exists'); // throw new Error('hook' + eventName + 'not exists')
            const cb = (ctx) => handler(ctx, namespace);
            if (eventName === 'onMessage')
                return this.onMessage('common', cb);
            this[eventName](cb);
        });
        // todo: database
        // chainable function
        const messageHandler = plugin.create(options, namespace);
        return {
            namespace,
            messageHandler
        };
    }
    async use(plugin) {
        const pluginCtx = await this.initPlugin(plugin);
        this.plugins.set(plugin, pluginCtx);
    }
    start() {
        this.onMessage('common', createChain(Array.from(this.plugins).map(([, { messageHandler }]) => messageHandler)));
    }
}
exports.QQbot = QQbot;
