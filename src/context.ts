'use strict';
import { MyWebSocket, QQbot } from 'qqbot';
import { CqApi } from './cq_api';

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
    fastReply (message: any, auto_escape: boolean = false) {
        if (this.group_id) {
            return this.client.sendGroupMsg({ group_id: this.group_id, message, auto_escape });
        }
        if (this.sender_id) {
            return this.client.sendPrivateMsg({ user_id: this.sender_id, group_id: undefined, message, auto_escape });
        }
        this.bot.warn(`failed to reply ${this.message_id}, without group / sender id.`);
    }
}
