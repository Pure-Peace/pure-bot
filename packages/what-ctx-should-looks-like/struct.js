const MessageEvent = {
    platform: 'onebot',
    message: {
        id: '123456',
        content: 'suitable message type!',
        sender: {
            name: 'ari',
            id: {
                get platform () {
                    return MessageEvent.platform;
                },
                userId: '1234567',
                toString () {
                    return `${this.platform}@${this.userId}`;
                }
            }
        }
    },

    send (message) {
        if (typeof message === 'string') message = { content: message };
        if (message.reply) console.log('reply to messageId', message.reply);
        if (message.at) console.log('at', message.at);
        console.log('sending message:', message.content);
        console.log('======');
    },
    reply (reply) {
        if (typeof reply === 'string') reply = { content: reply };
        return this.send({
            reply: this.message.id,
            ...reply
        });
    }
};

const PublicMessageEvent = Object.assign({
    get publicMessage () {
        return this.message;
    }
}, MessageEvent);
const GroupMessageEvent = Object.assign({
    get groupMessage () {
        return this.message;
    }
}, PublicMessageEvent);

console.log(GroupMessageEvent.groupMessage?.content ?? 'not a channel message event');
console.log(GroupMessageEvent.channelMessage?.content ?? 'not a channel message event');
console.log(GroupMessageEvent.publicMessage?.content ?? 'not a public message event');
console.log(GroupMessageEvent.privateMessage?.content ?? 'not a private message event');
console.log();
GroupMessageEvent.reply('reply to message');
GroupMessageEvent.send({
    at: GroupMessageEvent.message.sender.id.toString(),
    content: 'at sender'
});
GroupMessageEvent.send('a quick message');
