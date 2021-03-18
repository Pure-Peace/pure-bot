'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContext = void 0;
const cq_api_1 = require("./cq_api");
class MessageContext {
    constructor(msg, ws, bot) {
        this.msg = msg;
        this.ws = ws;
        this.bot = bot;
        this.client = new cq_api_1.CqApi(ws, bot);
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
    fastReply(message, auto_escape = false) {
        if (this.group_id) {
            return this.client.sendGroupMsg({ group_id: this.group_id, message, auto_escape });
        }
        if (this.sender_id) {
            return this.client.sendPrivateMsg({ user_id: this.sender_id, group_id: undefined, message, auto_escape });
        }
        this.bot.warn(`failed to reply ${this.message_id}, without group / sender id.`);
    }
}
exports.MessageContext = MessageContext;
//# sourceMappingURL=context.js.map