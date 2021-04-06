import { Scope, PlatformType } from './Event';
import { Module } from './Module';
export namespace Context {
  export type File = {
    name?: string;
    size?: number;
    url?: string;
    path?: string;
    blob?: Blob;
    buffer?: Buffer;
  };
  export type Sender = {
    name?: string;
    id:
    | string
    | {
      toString: () => string;
    };
  };
  export type Channel = Sender;
  export type Group = Sender;
  export type MessageSegment = {
    text?: string; // message in text
    raw?: string; // raw message
    notify?: Sender | Channel | Group; // @<userId> in onebot
    quote?: any; // reply in onebot
    CQCode?: string;
    file?: File; // send | recive image
    image?: File; // send | recive image
    audio?: File; // send | recive audio
    json?: Object; // send | recive json data
    adaptiveCard?: Object;
  };
  export type Message = string | MessageSegment;

  export interface InboundEvent {
    message: MessageSegment & {
      text: string;
      raw: string;
      segments: MessageSegment[];
      sender: Sender;
      channel?: Channel;
      group?: Group;
    };
  }

  export type ScopedEvents = Partial<InboundEvent>;
  export type ScopedContext = Partial<Record<Scope, InboundEvent>>;
  export type PlatformContext = Partial<Record<PlatformType, ScopedContext>>;
  export type MessageContext = Partial<PlatformContext> & {
    message: InboundEvent['message'];
  };

  export interface Context extends MessageContext {
    id: any,
    rawEvent: Module.Event;
    getPlatform?: (
      platformType: string
    ) => [
        {
          instance: Module.Instance;
          transmitter: Module.Transmitter;
          receiver: Module.Receiver;
          features: Module.Features;
        }
      ];
    quote: (msg: Message | Message[]) => Promise<void>;
    send: (msg: Message | Message[]) => Promise<void>;
    notify: (msg: Message | Message[]) => Promise<void>
    source: {
      sender: Sender;
      channel?: Channel;
      group?: Group;
    }
    transmitter?: Module.Transmitter;
    features?: Module.Features;
    database?: {
      user: any;
      channel: any;
      bot: any;
    };
  }
}
