type MessageSegment = {
    id?: string, // message id
    text?: string, // message in text
    raw?: string // raw message
    notify?: string, // @<userId> in onebot
    quote?: string, // reply in onebot
    file?: string, // send | recive image
    image?: string, // send | recive image
    audio?: string, // send | recive audio
    json?: JSON // send | recive json data
    adaptiveCard?: JSON
}
type Message = string | MessageSegment

type RecivedMessage = MessageSegment & {
    id: string | {
        toString: () => string
    },
    text: string,
    raw: string,
    segments: [MessageSegment],
    sender: {
        name?: string,
        id: string | {
            toString: () => string
        },
    }
}

type PlatformType = 'onebot'
type MessageType = 'privateMessage' | 'publicMessage' | 'channelMessage' | 'groupMessage' | 'message'

type TypedMessageContext = Partial<Record<MessageType, RecivedMessage>>

type PlatformContext = Partial<Record<PlatformType, TypedMessageContext>>

type MessageContext = PlatformContext & {
    platform: string,
    message: RecivedMessage
    quote: (msg: Message | [Message]) => Promise<void>,
    send: (msg: Message | [Message]) => Promise<void>
}
const text = 'suitable message type!';
const MessageEvent = {
    platform: 'onebot',
    message: {
        id: '123456',
        text,
        raw: text,
        segments: [{
            text: text
        }],
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
    send (message: string | Message | [Message]) {
        if (Array.isArray(message)) return message.map(m => this.send(m));
        if (typeof message === 'string') return this.send({ text: message });
        if (message.quote) console.log('quote to messageId', message.quote);
        if (message.notify) console.log('notify', message.notify);
        console.log('sending message:', message.text);
        console.log('======');
    },
    quote (quote: string | Message | [Message]) {
        if (Array.isArray(quote)) return quote.map(m => this.send(m));
        if (typeof quote === 'string') return this.quote({ text: quote });
        return this.send({
            quote: this.message.id,
            ...quote
        });
    }
} as MessageContext;

const PublicMessageEvent = Object.assign({
    get publicMessage () {
        return this.message;
    }
}, MessageEvent) as MessageContext;
const GroupMessageEvent = Object.assign({
    get groupMessage () {
        return this.message;
    }
}, PublicMessageEvent) as MessageContext;
const OnebotGroupMessageEvent = Object.assign({
    get groupMessage () {
        return this.message;
    },
    get onebot () {
        return this;
    }
}, PublicMessageEvent) as MessageContext;

console.log(GroupMessageEvent.message === GroupMessageEvent.onebot?.groupMessage);
console.log(OnebotGroupMessageEvent.message === OnebotGroupMessageEvent.onebot?.groupMessage);
console.log();
GroupMessageEvent.quote('quote to message');
GroupMessageEvent.send({
    notify: GroupMessageEvent.message.sender.id.toString(),
    text: 'notify sender'
});
GroupMessageEvent.send('a quick message');
