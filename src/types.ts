import { EventEmitter } from 'events';

export type PlatformType = 'onebot' | 'discord' | 'kaiheila';
export type MessageType =
  | 'privateMessage'
  | 'publicMessage'
  | 'channelMessage'
  | 'groupMessage'
  | 'message';

export namespace Context {
  type MessageSegment = {
    id?: string; // message id
    text?: string; // message in text
    raw?: string; // raw message
    notify?: string; // @<userId> in onebot
    quote?: string; // reply in onebot
    file?: string; // send | recive image
    image?: string; // send | recive image
    audio?: string; // send | recive audio
    json?: JSON; // send | recive json data
    adaptiveCard?: JSON;
  };
  export type Message = string | MessageSegment;
  export type Sender = {
    name?: string;
    id:
      | string
      | {
          toString: () => string;
        };
  };

  type RecivedMessage = MessageSegment & {
    id:
      | string
      | {
          toString: () => string;
        };
    text: string;
    raw: string;
    segments: [MessageSegment];
    sender: Sender;
  };

  type TypedMessageContext = Partial<Record<MessageType, RecivedMessage>>;

  type PlatformContext = Partial<Record<PlatformType, TypedMessageContext>>;

  export type MessageContext = PlatformContext & {
    platform: string;
    message: RecivedMessage;
    bots: [Bot: Object];
    quote: (msg: Message | [Message]) => Promise<void>;
    send: (msg: Message | [Message]) => Promise<void>;
  };

  export type Context = MessageContext & {
    sender: Sender;
    database?: {
      user: any,
      channel: any,
      bot: any,
    }
  };
}

export namespace Module {
  export type NextFunction = (arg: void | CallableFunction) => void;
  export type ChainableHandler = (
    ctx: Context.Context,
    next: NextFunction
  ) => any;
  export type Instance = any;
  export type HookHandler = (this: Instance, ctx: Context.Context) => void;
  export type FilterHandler = (
    this: Instance,
    ctx: Context.Context
  ) => Promise<boolean>;
  export interface Platform {
    source: EventEmitter;
    send: (target: any, message: Context.Message) => any;
  }
  export interface Interface {
    name: string;
    instance: (options: any) => Instance;

    database?: Partial<{
      fields: Record<string, any>;
      extends: Record<string, any>;
      virtual: Record<string, any>;
      metohds: Record<string, any>;
      collections: Record<string, string>;
    }>;

    // not first problem: hot reload across different process
    sleep?: (this: Instance) => JSON;
    resume?: (snapshot: JSON, options) => Instance;
  }
  export interface Plugin extends Interface {
    create?: (this: Instance) => ChainableHandler;
    hooks?: Record<string, HookHandler>;
  }
  export interface Provider extends Interface {
    provide: (this: Instance) => Platform;
  }
  export interface Filter extends Interface {
    filter: FilterHandler;
  }
}

export interface Bot {
  use: (module: Module.Interface, options: any) => any;
  remove: (symbol: Symbol) => any;
  reuse: (module: Module.Interface, instance: Module.Instance) => any;
  // on: (eventName: string, handle: Module.HookHandler) => any;

  // not first problem: graceful restart & stop
  stop?: () => Promise<void>;
  resume?: () => Promise<void>;
  reload?: () => Promise<void>;
  restart?: () => Promise<void>;
}
