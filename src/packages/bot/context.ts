import { Bot, Context, Module } from 'types';
const messageMixin = (message: Context.Message | Context.Message[], mixin: Object): Context.Message | Context.Message[] => {
    if (Array.isArray(message)) {
        const firstItem = message.findIndex(m => m);
        message[firstItem] = messageMixin(message[firstItem], mixin) as Context.Message;
        return message as Context.Message[];
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
        } as Context.Message;
    }
    throw new Error('unknown type of message');
};

export default function createContext (bot: Bot, event: Module.Event, symbol: Symbol): Context.All {
    const transmitter: Module.Transmitter = bot.transmitters.get(symbol) as Module.Transmitter;
    const platformFeatures: Module.Features = bot.platformFeatures.get(symbol) as Module.Features;
    const platform: Module.Platform = bot.platforms.get(symbol);
    const platformName: string[] = (event.platform && [event.platform]) || Array.isArray(platform.platform) ? platform.platform as string[] : [platform.platform] as string[];
    const source: Context.Source.Interface = event.source;
    const copiedEvent: Module.Event = {
        ...event
    } as Module.Event;
    const mixin: object = {
        [event.type]: copiedEvent[event.type],
        [event.scope || 'default']: {
            [event.type]: copiedEvent[event.type]
        },
        source
    };
    const platformMixin: object = platformName.reduce((obj, p) => {
        obj[p] = mixin;
        return obj;
    }, {});
    const target = source.group ?? source.channel ?? source.sender;
    target.scope = event.scope;
    const send = async (message: Context.Message | Context.Message[]) => transmitter.send(source.channel || source.sender, message);
    const quote = async (message: Context.Message | Context.Message[]) => send(messageMixin(message, { quote: source.sender }));
    const notify = async (message: Context.Message | Context.Message[]) => send(messageMixin(message, { notify: source.sender }));
    return {
        id: copiedEvent.id,
        rawEvent: copiedEvent,
        transmitter,
        features: platformFeatures,
        ...platformFeatures,
        ...platformMixin,
        ...mixin,
        source,
        send,
        quote,
        notify
    } as Context.All;
}
