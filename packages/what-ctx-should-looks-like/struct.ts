type SendMessage = string | {
    content: string,
    at: string,
    quote: string,
    file: string,
    image: string,
}

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
    send (message: string | SendMessage | [SendMessage]) {
        if (Array.isArray(message)) return message.map(m => this.send(m));
        if (typeof message === 'string') return this.send({ content: message });
        if (message.quote) console.log('quote to messageId', message.quote);
        if (message.at) console.log('at', message.at);
        console.log('sending message:', message.content);
        console.log('======');
    },
    quote (quote: string | SendMessage | [SendMessage]) {
        if (Array.isArray(quote)) return quote.map(m => this.send(m));
        if (typeof quote === 'string') return this.quote({ content: quote });
        return this.send({
            quote: this.message.id,
            ...quote
        });
    }
} as Partial<any>;

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
const OnebotGroupMessageEvent = Object.assign({
    get groupMessage () {
        return this.message;
    },
    get onebot () {
        return this;
    }
}, PublicMessageEvent);

console.log(GroupMessageEvent.message === GroupMessageEvent.onebot?.groupMessage);
console.log(OnebotGroupMessageEvent.message === OnebotGroupMessageEvent.onebot?.groupMessage);
console.log();
GroupMessageEvent.quote('quote to message');
GroupMessageEvent.send({
    at: GroupMessageEvent.message.sender.id.toString(),
    content: 'at sender'
});
GroupMessageEvent.send('a quick message');
