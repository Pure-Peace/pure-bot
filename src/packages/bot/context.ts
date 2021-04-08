import { Bot, Context, Module } from 'types';
const messageMixin = (message: Context.Message | Context.Message[], mixin: Object): Context.Message | Context.Message[] => {
    if (Array.isArray(message)) {
        const firstItem = message.findIndex(m => m);
        // @ts-expect-error
        // eslint-disable-next-line no-unused-vars
        message[firstItem] = messageMixin(message[firstItem], mixin);
        return message;
    }
    if (typeof message === 'object') {
        return {
            ...message,
            ...mixin
        } as Context.Message;
    }
    if (typeof message === 'string') {
        return {
            text: message,
            ...mixin
        };
    }
    throw new Error('unknown type of message');
};

export default function createContext (bot: Bot, event: Module.Event, symbol: Symbol): Context.All {
    const transmitter = bot.transmitters.get(symbol) as Module.Transmitter;
    const platformFeatures = bot.platformFeatures.get(symbol) as Module.Features;
    const platform = bot.platforms.get(symbol);
    const platformName = platform.platform;
    const source = {
        sender: event.source.sender,
        channel: event.source.channel,
        group: event.source.group
    };
    const copiedEvent = {
        ...event,
        source
    } as Module.Event;
    const send = (message: Context.Message | Context.Message[]) => transmitter.send(event.source.channel || event.source.sender, message);
    const quote = (message: Context.Message | Context.Message[]) => send(messageMixin(message, { quote: source.sender }));
    const notify = (message: Context.Message | Context.Message[]) => send(messageMixin(message, { notify: source.sender }));
    return {
        id: copiedEvent.id,
        rawEvent: copiedEvent,
        transmitter,
        features: platformFeatures,
        ...platformFeatures,
        source,
        [event.type]: event[event.type],
        [event.scope || 'default']: {
            [event.type]: copiedEvent[event.type]
        },
        [platformName]: {
            [event.type]: copiedEvent[event.type],
            [event.scope || 'default']: {
                [event.type]: copiedEvent[event.type]
            },
            source
        },
        send,
        quote,
        notify
    } as Context.All;
}
