import { EventEmitter } from 'events';
import { Context } from './Context';
export namespace Module {
  export type NextFunction = (arg: void | NextFunction) => void;
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
  export interface BaseModule {
    name: string;
    instance: (options: any) => Instance | Promise<Instance>;

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
  export interface Plugin extends BaseModule {
    handle?: (this: Instance) => ChainableHandler;
    hooks?: Record<string, HookHandler>;
  }

  export interface Receiver {
    source: EventEmitter;
  }
  export interface Transmitter {
    send: (
      target: Context.Sender,
      message: Context.Message | Context.Message[]
    ) => Promise<any>;
  }
  export type Features = Record<string, (this: Instance, ctx: Context.Context, ...args) => Promise<any>>
  export interface Platform extends BaseModule {
    platform: string,
    receiver: (this: Instance) => Receiver | Promise<Receiver>;
    transmitter: (this: Instance) => Transmitter | Promise<Transmitter>;
    features: Features;
  }

  export interface Filter extends BaseModule {
    filter: FilterHandler;
  }

  export interface Event {
    id: any,
    scope: string,
    type: string,
    platform?: string,
    sender: Context.Sender,
    channel?: Context.Channel,
    group?: Context.Group
  }
}
