type MessageSegment = {
    id?: string,
    text?: string,
    notify?: string,
    quote?: string,
    file?: string,
    image?: string,
    toString?: () => string;
}
type Message = string | MessageSegment

type MessageContextMessage = MessageSegment & {
    id: string,
    text?: string,
    segments: [MessageSegment] | {
        get: () => [MessageSegment]
    },
    sender: {
        name?: string,
        id: string
    }
}

type PlatformType = 'onebot'
type MessageType = 'privateMessage' | 'publicMessage' | 'channelMessage' | 'groupMessage'

type TypedMessageContext = Partial<Record<MessageType, MessageContextMessage>>

type PlatformContext = Partial<Record<PlatformType, TypedMessageContext>>

type MessageContext = PlatformContext & {
    platform: string,
    message: MessageContextMessage
    quote: (msg: Message | [Message]) => Promise<void>,
    send: (msg: Message | [Message]) => Promise<void>
}

const MessageEvent = {
    platform: 'onebot',
    message: {
        id: '123456',
        text: 'suitable message type!',
        segments: {
            get () {
                return [{
                    text: MessageEvent.message.text
                } as Message];
            }
        },
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
} as unknown as MessageContext;

const PublicMessageEvent = Object.assign({
    get publicMessage () {
        return this.message;
    }
}, MessageEvent) as unknown as MessageContext;
const GroupMessageEvent = Object.assign({
    get groupMessage () {
        return this.message;
    }
}, PublicMessageEvent) as unknown as MessageContext;
const OnebotGroupMessageEvent = Object.assign({
    get groupMessage () {
        return this.message;
    },
    get onebot () {
        return this;
    }
}, PublicMessageEvent) as unknown as MessageContext;

console.log(GroupMessageEvent.message === GroupMessageEvent.onebot?.groupMessage);
console.log(OnebotGroupMessageEvent.message === OnebotGroupMessageEvent.onebot?.groupMessage);
console.log();
GroupMessageEvent.quote('quote to message');
GroupMessageEvent.send({
    notify: GroupMessageEvent.message.sender.id.toString(),
    text: 'notify sender'
});
GroupMessageEvent.send('a quick message');
