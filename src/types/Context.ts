import { Scope, PlatformType } from './Event';
import { Module } from './Module';
/**
 * Context
 */
export namespace Context {
  /**
   * MessageSegment.file | MessageSegment.audio | MessageSegment.image etc.
   */
  export type File = {
    name?: string;
    size?: number;
    url?: string;
    path?: string;
    blob?: Blob;
    buffer?: Buffer;
  };
  /**
   * Source: who/where a event is emitted/triggered
   */
  export namespace Source {
    /**
     * Module could append additional information to Sender and accessable as target in Module.Transmitter.send()
     */
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
    export interface Interface {
      sender: Sender;
      channel?: Channel;
      group?: Group;
    }
  }
  /**
   * parsed message format.
   */
  export type MessageSegment = {
    text?: string; // message in text
    raw?: string; // raw message
    notify?: Source.Sender | Source.Channel | Source.Group; // @<userId> in onebot
    quote?: any; // reply in onebot
    CQCode?: string;
    file?: File; // send | recive image
    image?: File; // send | recive image
    audio?: File; // send | recive audio
    json?: Object; // send | recive json data
    adaptiveCard?: Object;
  };
  /**
   * legacy support string as message, should be removed.(use root level Message.text | Message.raw instead)
   */
  export type Message = string | MessageSegment;

  /**
   * data of context
   */
  export interface InboundEvent {
    message?: MessageSegment & {
      text: string;
      raw: string;
      segments: MessageSegment[];
    };
    source: Source.Interface;
  }

  export type ScopedEvents = Partial<InboundEvent>;
  export type ScopedContext = Partial<Record<Scope, InboundEvent>>;
  export type PlatformContext = Partial<Record<PlatformType, ScopedContext>>;

  /**
   * context interface
   */
  export interface Context {
    id: any;
    rawEvent: Module.Event;
    /**
     * return platforms that declared its type as `platformType`
     */
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
    /**
     * quote: `CQ:reply` in onebot
     */
    quote: (msg: Message | Message[]) => Promise<void>;
    send: (msg: Message | Message[]) => Promise<void>;
    /**
     * notify: `CQ:at` in onebot
     */
    notify: (msg: Message | Message[]) => Promise<void>;
    source: Source.Interface;
    transmitter?: Module.Transmitter;
    features?: Module.Features;
    database?: {
      user: any;
      channel: any;
      bot: any;
    };
  }
  export type MessageContext = Context & Partial<PlatformContext> & Partial<ScopedContext> & {
    message: InboundEvent['message'];
  };
  export type All = MessageContext
}
