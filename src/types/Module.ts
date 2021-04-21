import { EventEmitter } from 'events';
import { Bot } from './Bot';
import { Context } from './Context';
import * as E from './Event';
export namespace Module {
  export type NextFunction = (arg: void | NextFunction) => void;
  export type ChainableHandler = (
    ctx: Context.All,
    next: NextFunction
  ) => any;
  export type Instance = any;
  export type HookHandler = (this: Instance, ctx: Context.All) => void;
  export type FilterHandler = (
    this: Instance,
    ctx: Context.All
  ) => boolean | Promise<boolean>;
  export type InitInstanceFunction = (
    options: any
  ) => Instance | Promise<Instance>;
  export interface BaseModule {
    name?: string;
    instance: InitInstanceFunction;

    database?: Partial<{
      fields: Record<string, any>;
      extends: Record<string, any>;
      virtual: Record<string, any>;
      metohds: Record<string, any>;
      collections: Record<string, string>;
    }>;

    // not first problem: hot reload across different process
    sleep?: (this: Instance) => Object;
    resume?: (snapshot: Object, options) => Instance;
  }
  /**
   * plugin module should have at least a handle() function or a hook
   */
  export interface Plugin extends BaseModule {
    handle?: (
      this: Instance,
      bot: Bot
    ) => ChainableHandler | ChainableHandler[];
    hooks?: Record<string, HookHandler>;
  }

  /**
   * a Platform should emit received message in Receiver.source<br>
   * event format should compatible with [[Module.Event]]
   */
  export interface Receiver {
    source: EventEmitter;
  }
  /**
   * a Platform should return a Transmitter implement this interface for bot to send events. <br>
   * will be passed to handler as [[Context.transmitter]]
   */
  export interface Transmitter {
    send: (
      target: Context.Source.Sender,
      message: Context.Message | Context.Message[]
    ) => any | Promise<any>;
  }
  /**
   * platform specified features. <br>Will be destructed into [[Context.All]].
   * ```Typescript
   * context = { context, ...Features };
   * ```
   */
  export type Features = Record<
    string,
    (this: Instance, ctx: Context.All, ...args) => any | Promise<any>
  >;
  export interface Platform extends BaseModule {
    platform: string| string[];
    receiver: (this: Instance, bot: Bot) => Receiver | Promise<Receiver>;
    transmitter: (
      this: Instance,
      bot: Bot
    ) => Transmitter | Promise<Transmitter>;
    features: Features;
  }

  export interface Filter extends BaseModule {
    filter: FilterHandler;
  }

  export interface Event {
    id: any;
    scope: E.Scope;
    type: E.EventType;
    platform?: E.PlatformType;
    source: Context.Source.Interface;
  }
}
