import { EventEmitter } from 'events';
import { Context } from './Context';
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
  export interface BaseModule {
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
      message: Context.Message | [Context.Message]
    ) => Promise<any>;
  }
  export type Features = Record<string, (this: Instance, ...args) => Promise<any>>
  export interface PlatformInterface extends BaseModule {
    platform: string,
    receiver: (this: Instance) => Receiver;
    transmitter: (this: Instance) => Transmitter;
    features: Features;
  }

  export interface Filter extends BaseModule {
    filter: FilterHandler;
  }
}
