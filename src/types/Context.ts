import { Scope, PlatformType } from './Event';
import { Module } from './Module';
export namespace Context {
  export type File = {
    name?: string,
    size?: number,
    url?: string,
    path?: string,
    blob?: Blob,
    buffer?: Buffer
  }
  type MessageSegment = {
    id?: string; // message id
    text?: string; // message in text
    raw?: string; // raw message
    notify?: string; // @<userId> in onebot
    quote?: string; // reply in onebot
    file?: File; // send | recive image
    image?: File; // send | recive image
    audio?: File; // send | recive audio
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

  export interface InboundEvent {
    message: MessageSegment & {
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
  };

  export type ScopedEvents = Partial<InboundEvent>;

  // export interface ScopedContext extends Context, InboundEvent {}
  export type ScopedContext = Partial<Record<Scope, InboundEvent>>
  // type ScopedContext = Partial<> & Context;

  export type PlatformContext = Partial<Record<PlatformType, ScopedContext>>;

  export type MessageContext = Partial<PlatformContext> & {
    message: InboundEvent['message']
  }

  export interface Context extends MessageContext {
    platform: string;
    bots: [Bot: Object];
    quote: (msg: Message | [Message]) => Promise<void>;
    send: (msg: Message | [Message]) => Promise<void>;
    sender: Sender;
    transmitter?: Module.Transmitter;
    features?: Module.Features;
    database?: {
      user: any;
      channel: any;
      bot: any;
    };
  };
}
