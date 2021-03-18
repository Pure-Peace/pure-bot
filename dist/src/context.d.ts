import { MyWebSocket, QQbot } from 'qqbot';
import { CqApi } from './cq_api';
export declare class MessageContext {
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
    constructor(msg: any, ws: MyWebSocket, bot: QQbot);
    /**
     * 快速回复
     * @param {any} message - 回复的消息，可以是任意格式。
     * @param {boolean} auto_escape - 不解析消息内容
     */
    fastReply(message: any, auto_escape?: boolean): Promise<unknown>;
}
//# sourceMappingURL=context.d.ts.map