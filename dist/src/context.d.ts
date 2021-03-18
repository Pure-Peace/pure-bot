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
    group_id: any;
    time: any;
    constructor(msg: any, ws: MyWebSocket, bot: QQbot);
    fastReply(message: any, auto_escape?: boolean): Promise<unknown>;
}
//# sourceMappingURL=context.d.ts.map