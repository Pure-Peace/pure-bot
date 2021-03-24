'use strict';
import { MyWebSocket, QQbot } from 'onebot/qqbot';
import { CqApi } from './cq_api';

export type PostType = 'meta_event' | 'request' | 'notice' | 'message';
export type MessageBase = {
    time: number,
    self_id: number,
    post_type: PostType
};

export namespace MessageEvent {
    export type MessageType = 'private' | 'group';
    export type PrivateSubType = 'friend' | 'group' | 'other';
    export type GroupSubType = 'normal' | 'anonymous' | 'notice';

    export type Public = MessageBase & {
        post_type: 'message',
        message_type: MessageType,
        sub_type: PrivateSubType,
        message_id: number,
        user_id: number,
        message: object,
        raw_message: string,
        font: number,
        sender: object
    };

    export type Private = Public & {
        message_type: 'private',
        sub_type: PrivateSubType,
    };

    export type Group = Public & {
        message_type: 'group',
        sub_type: GroupSubType,
        group_id: number,
        anonymous: object,
    };
};

/* export namespace NoticeEvent {
    export type NoticeTypeGroup = 'group_upload' | 'group_admin' | 'group_decrease' | 'group_increase' | 'group_ban' | 'group_recall' |'notify';
    export type NoticeTypePrivate = 'friend_recall' | 'friend_add';
    export type GroupSubType =

}; */

export const contextFactory = (event: PostType, msg: any, ws: MyWebSocket, bot: QQbot): MessageContext => {
    if (event === 'message') {
        return new MessageContext(msg as MessageEvent.Private, ws, bot);
    }
};

export class MessageContext {
    msg: any;
    ws: MyWebSocket;
    bot: QQbot;
    client: CqApi;
    self_id: number;
    user_id: number;
    sender_id: number;
    sender_name: string;
    sender_group_name: string;
    sender_group_title: string;
    about_self: boolean;
    raw_message: string;
    message_id: number;
    is_group: boolean;
    group_id?: number;
    time: any;
    constructor (msg: any, ws: MyWebSocket, bot: QQbot) {
        this.msg = msg;
        this.ws = ws;
        this.bot = bot;

        this.client = new CqApi(ws, bot);

        this.self_id = msg.self_id;
        this.user_id = msg.user_id;
        this.sender_id = msg.user_id;
        this.sender_name = msg.nickname;
        this.sender_group_name = msg.sender?.card ?? '';
        this.sender_group_title = msg.sender?.title ?? '';

        this.about_self = msg.raw_message ? msg.raw_message.includes(bot.name) : false;
        this.raw_message = msg.raw_message;
        this.message_id = msg.message_id;

        this.is_group = !!msg.group_id;
        this.group_id = msg.group_id;

        this.time = msg.time;
    }

    /**
     * 快速回复
     * @param {any} message - 回复的消息，可以是任意格式。
     * @param {boolean} auto_escape - 不解析消息内容
     */
    reply (message: any, auto_escape: boolean = false) {
        if (this.group_id) {
            return this.client.sendGroupMsg({ group_id: this.group_id, message, auto_escape });
        }
        if (this.sender_id) {
            return this.client.sendPrivateMsg({ user_id: this.sender_id, group_id: undefined, message, auto_escape });
        }
        this.bot.warn(`failed to reply ${this.message_id}, without group / sender id.`);
    }
}
