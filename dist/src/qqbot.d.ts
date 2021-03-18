/// <reference types="node" />
import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { MessageContext } from './context';
import { Duration } from './utils';
export declare class MyWebSocket extends WebSocket {
    heartBeat: () => void;
    pingTimeout: NodeJS.Timeout;
    alive: boolean;
}
declare type handler = (ctx: MessageContext) => any;
declare type afterHandler = (ctx: MessageContext, result: any) => any;
declare type serverOptions = {
    port?: number;
    deactive_timeout?: number;
};
declare type handleFilters = {
    prefixes?: Array<string>;
    regexs?: Array<RegExp>;
    keywords?: Array<string>;
    include_qq?: Array<string | number>;
    include_group?: Array<string | number>;
    exclude_qq?: Array<string | number>;
    exclude_group?: Array<string | number>;
};
declare type handlerTask = {
    handler: handler;
    filters: handleFilters;
    beforeChecker: handler;
    afterHandler: afterHandler;
};
declare type handleOptions = {
    where?: string;
    filters?: handleFilters;
    beforeChecker?: handler;
    afterHandler?: afterHandler;
};
declare type events = {
    message: {
        common: Array<handler>;
        private: {
            common: Array<handler>;
            friend: Array<handler>;
            group: Array<handler>;
            other: Array<handler>;
        };
        group: {
            common: Array<handler>;
            normal: Array<handler>;
            anonymous: Array<handler>;
            notice: Array<handler>;
        };
    };
    notice: {
        common: Array<handler>;
        private: {
            common: Array<handler>;
            friend_add: Array<handler>;
            friend_recall: Array<handler>;
            notify: {
                common: Array<handler>;
                poke: Array<handler>;
                lucky_king: Array<handler>;
                honor: Array<handler>;
            };
        };
        group: {
            common: Array<handler>;
            group_upload: Array<handler>;
            group_admin: {
                common: Array<handler>;
                set: Array<handler>;
                unset: Array<handler>;
            };
            group_decrease: {
                common: Array<handler>;
                leave: Array<handler>;
                kick: Array<handler>;
                kick_me: Array<handler>;
            };
            group_increase: {
                common: Array<handler>;
                approve: Array<handler>;
                invite: Array<handler>;
            };
            group_ban: {
                common: Array<handler>;
                ban: Array<handler>;
                lift_ban: Array<handler>;
            };
            group_recall: Array<handler>;
            notify: {
                common: Array<handler>;
                poke: Array<handler>;
                lucky_king: Array<handler>;
                honor: Array<handler>;
            };
        };
    };
    request: {
        common: Array<handler>;
        friend: Array<handler>;
        group: {
            common: Array<handler>;
            add: Array<handler>;
            invite: Array<handler>;
        };
    };
    meta_event: {
        common: Array<handler>;
        lifecycle: {
            common: Array<handler>;
            connect: Array<handler>;
            enable: Array<handler>;
            disable: Array<handler>;
        };
        heartbeat: Array<handler>;
    };
};
export declare class QQbot {
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
    beforeHandleCheckers: ({
        handler: handler;
    } | {});
    afterHandlers: ({
        handler: afterHandler;
    } | {});
    server: WebSocket.Server;
    info: (...args: any[]) => {};
    log: (...args: any[]) => {};
    warn: (...args: any[]) => {};
    error: (...args: any[]) => {};
    constructor({ name, logName, logUnhandledInfo, logHeartbeat, debug, serverOptions, eventAssigns, customGlobalFilters, loggerOptions, beforeHandleCheckers, afterHandlers, initEventsMethod }: {
        name: string;
        logName?: string;
        logUnhandledInfo?: boolean;
        logHeartbeat?: boolean;
        debug?: boolean;
        serverOptions?: serverOptions;
        eventAssigns?: object;
        customGlobalFilters?: object;
        loggerOptions?: object;
        beforeHandleCheckers?: object;
        afterHandlers?: object;
        initEventsMethod?: (bot: QQbot) => any;
    });
    initServer(options: any): void;
    fastAddEventHandler(typeCheckIn: Array<string>, eventType: string, type: string, handler: handler, options: handleOptions): void;
    onMessage(type: ('common' | 'private' | 'group'), handler: handler, options?: handleOptions): void;
    onNotice(type: ('common' | 'private' | 'group'), handler: handler, options?: handleOptions): void;
    onRequest(type: ('common' | 'friend' | 'group'), handler: handler, options?: handleOptions): void;
    onMetaEvent(type: ('common' | 'lifecycle' | 'heartbeat'), handler: handler, options?: handleOptions): void;
    onLifecycle(lifecycle: ('connect' | 'enable' | 'disable'), handler: handler): void;
    defaultEvents(eventAssigns: Object): events;
    handleMessage(msg: any, ws: MyWebSocket): Promise<void>;
    fastEventHandler({ taskList, tipString, time, ctx, type }: {
        taskList: Array<handlerTask>;
        tipString: string;
        time: Duration;
        ctx: MessageContext;
        type: string;
    }): Promise<void>;
    beforeHandleCheck(ctx: MessageContext): Promise<boolean>;
    addBeforeChecker(name: string, handler: handler): void;
    removeBeforeChecker(name: string): void;
    afterHandle(ctx: MessageContext): Promise<void>;
    addAfterHandler(name: string, handler: handler): void;
    removeaddAfterHandler(name: string): void;
    eventHandlers: {
        message: (ctx: MessageContext) => Promise<void>;
        notice: (ctx: MessageContext) => Promise<void>;
        request: (ctx: MessageContext) => Promise<void>;
        meta_event: (ctx: MessageContext) => Promise<void>;
    };
    loggerize(options: object): void;
    format({ color, level }: {
        color?: string;
        level?: string;
    }): string;
    get clientCount(): number;
}
export {};
//# sourceMappingURL=qqbot.d.ts.map