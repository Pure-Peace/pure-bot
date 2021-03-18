'use strict';

import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import * as chalk from 'chalk';
import * as dayjs from 'dayjs';

import { MessageContext } from './context';
import { Duration, isAsyncFn } from './utils';
const parse = require('fast-json-parse');
const stringify = require('fast-json-stable-stringify');

export declare class MyWebSocket extends WebSocket {
    heartBeat: () => void;
    pingTimeout: NodeJS.Timeout;
    alive: boolean;
    sendJson: (data: any) => void;
}

type handler = (ctx: MessageContext) => any;
type afterHandler = (ctx: MessageContext, result: any) => any;
type serverOptions = { port?: number, deactive_timeout?: number };
type handleFilters = {
    prefixes?: Array<string>,
    regexs?: Array<RegExp>,
    keywords?: Array<string>,
    include_qq?: Array<string | number>,
    include_group?: Array<string | number>,
    exclude_qq?: Array<string | number>,
    exclude_group?: Array<string | number>
};
type handlerTask = {
    handler: handler,
    filters: handleFilters,
    beforeChecker: handler,
    afterHandler: afterHandler
};
type handleOptions = { where?: string, filters?: handleFilters, beforeChecker?: handler, afterHandler?: afterHandler };
type events = {
    message: {
        common: Array<handler>,
        private: {
            common: Array<handler>,
            friend: Array<handler>,
            group: Array<handler>,
            other: Array<handler>
        },
        group: {
            common: Array<handler>,
            normal: Array<handler>,
            anonymous: Array<handler>,
            notice: Array<handler>
        }
    },
    notice: {
        common: Array<handler>,
        private: {
            common: Array<handler>,
            friend_add: Array<handler>,
            friend_recall: Array<handler>,
            notify: {
                common: Array<handler>,
                poke: Array<handler>,
                lucky_king: Array<handler>,
                honor: Array<handler>,
            }
        },
        group: {
            common: Array<handler>,
            group_upload: Array<handler>,
            group_admin: {
                common: Array<handler>,
                set: Array<handler>,
                unset: Array<handler>,
            },
            group_decrease: {
                common: Array<handler>,
                leave: Array<handler>,
                kick: Array<handler>,
                kick_me: Array<handler>,
            },
            group_increase: {
                common: Array<handler>,
                approve: Array<handler>,
                invite: Array<handler>,
            },
            group_ban: {
                common: Array<handler>,
                ban: Array<handler>,
                lift_ban: Array<handler>,
            },
            group_recall: Array<handler>,
            notify: {
                common: Array<handler>,
                poke: Array<handler>,
                lucky_king: Array<handler>,
                honor: Array<handler>,
            }
        }
    },
    request: {
        common: Array<handler>,
        friend: Array<handler>,
        group: {
            common: Array<handler>,
            add: Array<handler>,
            invite: Array<handler>,
        }
    },
    meta_event: {
        common: Array<handler>,
        lifecycle: {
            common: Array<handler>,
            connect: Array<handler>,
            enable: Array<handler>,
            disable: Array<handler>,
        },
        heartbeat: Array<handler>,
    }
};

export class QQbot {
    id: string;
    name: string;
    logName: string;
    connected: boolean;
    debug: boolean;
    logUnhandledInfo: boolean;
    logHeartbeat: boolean;
    eventEmitter: EventEmitter;
    globalFilters: handleFilters;
    loggerOptions: {};
    totalSend: number;
    totalRecive: number;
    lastRecived: number;
    status: {};
    events: events;
    initEventsMethod: (bot: QQbot) => void;
    defaultHandleOptions: () => handleOptions;
    defaultFilters: handleFilters;
    beforeHandleCheckers: ({ handler: handler } | {});
    afterHandlers: ({ handler: afterHandler } | {});
    server: WebSocket.Server;
    info: (...args) => {};
    log: (...args) => {};
    warn: (...args) => {};
    error: (...args) => {};
    constructor ({
        name,
        logName,
        logUnhandledInfo,
        logHeartbeat,
        debug,
        serverOptions = { port: 8080, deactive_timeout: 5000 },
        eventAssigns = {},
        customGlobalFilters = {},
        loggerOptions = {},
        beforeHandleCheckers = {},
        afterHandlers = {},
        initEventsMethod = (bot) => { }
    }: {
        name: string,
        logName?: string,
        logUnhandledInfo?: boolean,
        logHeartbeat?: boolean,
        debug?: boolean,
        serverOptions?: serverOptions,
        eventAssigns?: object,
        customGlobalFilters?: object,
        loggerOptions?: object,
        beforeHandleCheckers?: object,
        afterHandlers?: object,
        initEventsMethod?: (bot: QQbot) => any
    }) {
        this.defaultHandleOptions = () => { return { where: '', filters: this.globalFilters, beforeChecker: undefined, afterHandler: undefined } };
        this.defaultFilters = { prefixes: [], regexs: [], keywords: [], include_qq: [], include_group: [], exclude_qq: [], exclude_group: [] };

        this.id = '?';
        this.name = name ?? 'default';
        this.logName = logName ?? 'QQBot';
        this.connected = false;
        this.debug = debug ?? true;
        this.logUnhandledInfo = logUnhandledInfo ?? true;
        this.logHeartbeat = logHeartbeat ?? true;
        this.eventEmitter = new EventEmitter();
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
    }

    initServer (options) {
        this.server = new WebSocket.Server(options);
        this.info(chalk.yellowBright(`started, waiting for ws connect... (port: ${options.port})`));

        this.server.on('connection', async (ws: MyWebSocket) => {
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

    fastAddEventHandler (typeCheckIn: Array<string>, eventType: string, type: string, handler: handler,
        options: handleOptions) {
        let { where, filters, beforeChecker, afterHandler } = Object.assign(this.defaultHandleOptions(), options);
        const handlerTask: handlerTask = { handler, filters, beforeChecker, afterHandler };

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
            if (e[type].constructor === Array) e[type].push(handlerTask);
            else e[type].common.push(handlerTask);
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
        } else {
            if (where in e[type]) {
                e[type][where].push(handlerTask);
                success();
                return;
            }
        }
        this.error(`error when add handler, 'where' of '${handlerChalked}' type '${type}' must in [${Object.keys(e[type])}]${extraTypes || ''}, got '${where}'.`);
    }

    onMessage (type: ('common' | 'private' | 'group'),
        handler: handler,
        options: handleOptions = {}) {
        this.fastAddEventHandler(['common', 'private', 'group'], 'message', type, handler, options);
    }

    onNotice (type: ('common' | 'private' | 'group'),
        handler: handler,
        options: handleOptions = {}) {
        this.fastAddEventHandler(['common', 'private', 'group'], 'notice', type, handler, options);
    }

    onRequest (type: ('common' | 'friend' | 'group'),
        handler: handler,
        options: handleOptions = {}) {
        this.fastAddEventHandler(['common', 'friend', 'group'], 'request', type, handler, options);
    }

    onMetaEvent (type: ('common' | 'lifecycle' | 'heartbeat'),
        handler: handler,
        options: handleOptions = {}) {
        this.fastAddEventHandler(['common', 'lifecycle', 'heartbeat'], 'meta_event', type, handler, options);
    }

    onLifecycle (lifecycle: ('connect' | 'enable' | 'disable'),
        handler: handler) {
        const handlerChalked = `${chalk.yellowBright('lifecycle')}`;
        const lifecycles = ['connect', 'enable', 'disable'];

        if (!lifecycles.includes(lifecycle)) {
            this.error(`invalid lifecycle: ${lifecycle}, should be in ${lifecycles.join(', ')}`);
            return;
        }

        this.events.meta_event[lifecycle].push(handler);
        this.info(`success to add ${handlerChalked} handler: ${chalk.green(lifecycle)}`);
    }

    defaultEvents (eventAssigns: Object) {
        const defaultEvents: events = {
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
                        async (ctx: MessageContext) => {
                            this.connected = true;
                            ctx.ws.alive = true;
                            this.id = ctx.msg.self_id;
                            this.info(chalk.yellowBright('successfully connected! online now!'));
                        }],
                    enable: [],
                    disable: []
                },
                heartbeat: [
                    async (ctx: MessageContext) => {
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

    async handleMessage (msg: any, ws: MyWebSocket) {
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
        const ctx = new MessageContext(msg, ws, this);

        // do before check
        if (!this.beforeHandleCheck(ctx)) {
            return;
        }

        // handle event
        const event = msg.post_type;
        const handler = this.eventHandlers[event];
        if (handler) {
            handler(ctx);
        } else if (msg.echo) {
            this.eventEmitter.emit(msg.echo, msg);
            this.info(`recived api call result, id: ${chalk.yellowBright(msg.echo)}; status: ${msg.status};`);
        } else {
            this.warn('Unhandled event:', event, '; msg:', msg);
        }
    }

    async fastEventHandler ({
        taskList, tipString, time, ctx, type
    }: { taskList: Array<handlerTask>, tipString: string, time: Duration, ctx: MessageContext, type: string }) {
        const isHeartbeat = ctx.msg.meta_event_type === 'heartbeat';
        const condi0 = !isHeartbeat &&
            (this.logUnhandledInfo && (!taskList || taskList.length === 0));
        if (
            (isHeartbeat && this.logHeartbeat) || condi0
        ) {
            this.warn(`Unhandled ${chalk.yellowBright(type)}.${tipString} message:`, ctx.msg, '; time:', time.elapsed().format());
            return;
        }

        const partLog = (...msg) => this.debug && this.warn(...msg);
        const readyTaskList: Array<handler> = [];
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
                    (isAsyncFn(t.beforeChecker) ? await t.beforeChecker(ctx) : t.beforeChecker(ctx)) === false) {
                    partLog('fastEventHandler: before checker blocked.');
                    continue;
                }

                // mixin after handler
                if (t.afterHandler) {
                    readyTaskList.push(async (ctx: MessageContext) => {
                        const res = isAsyncFn(t.handler) ? await t.handler(ctx) : t.handler(ctx);
                        isAsyncFn(t.afterHandler) ? await t.afterHandler(ctx, res) : t.afterHandler(ctx, res);
                    });
                } else {
                    readyTaskList.push(t.handler);
                }
            } else {
                readyTaskList.push(t as unknown as handler);
            }
        }

        Promise.allSettled(readyTaskList.map(handler => handler(ctx))).finally(() => {
            const condi1 = !isHeartbeat &&
                (this.logUnhandledInfo || (!this.logUnhandledInfo && readyTaskList.length !== 0));
            if (
                (isHeartbeat && this.logHeartbeat) || condi1
            ) {
                const baseInfo = `${readyTaskList.length} ${chalk.yellowBright(type)}.${tipString} handle done in ${time.elapsed().format()}.`;
                let extraInfo = '';
                if (ctx.msg.user_id) extraInfo += `sender: ${ctx.msg.user_id}; `;
                if (ctx.msg.group_id) extraInfo += `group: ${ctx.msg.group_id}; `;
                if (ctx.msg.raw_message) extraInfo += `raw_msg: ${ctx.msg.raw_message.slice(0, 200)};`;
                this.info(baseInfo, extraInfo ? `[${chalk.yellowBright(extraInfo)}]` : '');
            }
            this.afterHandle(ctx);
        });
    }

    async beforeHandleCheck (ctx: MessageContext) {
        for (const checker of Object.values(this.beforeHandleCheckers)) {
            const checkResult = isAsyncFn(checker) ? await checker(ctx) : checker(ctx);
            if (checkResult === false) {
                return false;
            }
        }
        return true;
    }

    addBeforeChecker (name: string, handler: handler) {
        const alreadyExists = this.beforeHandleCheckers[name];
        this.beforeHandleCheckers[name] = handler;
        this.info(`new before checker ${name} ${alreadyExists ? 'rewrited' : 'added'}.`);
    }

    removeBeforeChecker (name: string) {
        if (this.beforeHandleCheckers[name]) {
            delete (this.beforeHandleCheckers[name]);
            this.info(`before checker ${name} removed.`);
        }
        this.info(`before checker ${name} not exists.`);
    }

    async afterHandle (ctx: MessageContext) {
        const handlers = Object.values(this.afterHandlers);
        if (handlers.length > 0) {
            Promise.allSettled(handlers.map(func => func(ctx, this)));
        }
    }

    addAfterHandler (name: string, handler: handler) {
        const alreadyExists = this.afterHandlers[name];
        this.afterHandlers[name] = handler;
        this.info(`new after handler ${name} ${alreadyExists ? 'rewrited' : 'added'}.`);
    }

    removeaddAfterHandler (name: string) {
        if (this.afterHandlers[name]) {
            delete (this.afterHandlers[name]);
            this.info(`after handler ${name} removed.`);
        }
        this.info(`after handler ${name} not exists.`);
    }

    eventHandlers = {
        message: async (ctx: MessageContext) => {
            const msg = ctx.msg;
            const time = new Duration();

            const level1 = this.events.message;
            const level2 = level1[msg.message_type];
            const level3 = level2[msg.sub_type];
            const taskList = [...level1.common, ...level2.common, ...level3];

            const tipString = `${chalk.yellow(msg.message_type)}.${chalk.yellow(msg.sub_type || '.')}`;
            this.fastEventHandler({
                taskList, tipString, time, ctx, type: 'message'
            });
        },
        notice: async (ctx: MessageContext) => {
            const msg = ctx.msg;
            const time = new Duration();

            let taskList: Array<any>;
            if (['friend_add', 'friend_recall'].includes(msg.notice_type)) {
                msg.custom_type = 'private';
            } else if (!msg.group_id) {
                msg.custom_type = 'private';
            } else {
                msg.custom_type = 'group';
            }
            const level1 = this.events.notice;
            const level2 = level1[msg.custom_type];
            const level3 = level2[msg.notice_type];
            const level4 = level3[msg.sub_type];

            if (level3.constructor === Array) {
                taskList = [...level1.common, ...level2.common, ...level3];
            } else {
                taskList = [...level1.common, ...level2.common, ...level3.common, ...level4];
            }

            const tipString = `${chalk.yellow(msg.custom_type)}.${chalk.yellow(msg.notice_type + '.' + msg.sub_type || '.')}`;
            this.fastEventHandler({
                taskList, tipString, time, ctx, type: 'notice'
            });
        },
        request: async (ctx: MessageContext) => {
            const msg = ctx.msg;
            const time = new Duration();

            let taskList: Array<any>;
            const level1 = this.events.request;
            const level2 = level1[msg.request_type];
            const level3 = level2[msg.sub_type];

            if (level2.constructor === Array) {
                taskList = [...level1.common, ...level2];
            } else {
                taskList = [...level1.common, ...level2.common, ...level3];
            }

            const tipString = `${chalk.yellow(msg.request_type)}.${chalk.yellow(msg.sub_type || '.')}`;
            this.fastEventHandler({
                taskList, tipString, time, ctx, type: 'request'
            });
        },
        meta_event: async (ctx: MessageContext) => {
            const msg = ctx.msg;
            const time = new Duration();

            let taskList: Array<any>;
            const level1 = this.events.meta_event;
            const level2 = level1[msg.meta_event_type];
            const level3 = level2[msg.sub_type];

            if (level2.constructor === Array) {
                taskList = [...level1.common, ...level2];
            } else {
                taskList = [...level1.common, ...level2.common, ...level3];
            }

            const tipString = `${chalk.yellow(msg.meta_event_type)}.${chalk.yellow(msg.sub_type || '.')}`;
            this.fastEventHandler({
                taskList, tipString, time, ctx, type: 'meta_event'
            });
        }
    }

    loggerize (options: object) {
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
            this[key] = (...info: Array<any>) => console[key](this.format({ color: op.color, level: key.toUpperCase() }), ...info);
        }
    }

    format ({ color = 'green', level = 'INFO' }) {
        return `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${chalk[color](`[${level}]`)} ${this.logName} <${this.name}(${this.id})>`;
    }

    get clientCount () {
        return this.server.clients.keys.length;
    }
}
