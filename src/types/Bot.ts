import { Module } from './Module';
import { EventEmitter } from 'events';
export type Hooks = Array<{
  hookName: string;
  handler: (...args) => void;
}>;
export interface Bot {
  instances: Map<Symbol, Module.Instance>;
  filters: Map<Symbol, Module.FilterHandler>;
  platforms: Map<Symbol, Module.Platform>;
  platformFeatures: Map<Symbol, Module.Features>;
  receivers: Map<Symbol, Module.Receiver>;
  transmitters: Map<Symbol, Module.Transmitter>;
  platformEventHooks: Map<Symbol, Hooks>;
  plugins: Map<Symbol, Module.Plugin>;
  pluginHooks: Map<Symbol, Hooks>;
  middlewares: Map<Symbol, Module.ChainableHandler>;

  // createChain result
  activeMiddlewareChain: Module.HookHandler;
  inboundEvents: EventEmitter;
  filteredEvents: EventEmitter;
  use: (module: Module.BaseModule, options: any) => any;
  remove: (symbol: Symbol) => any;
  reuse: (module: Module.BaseModule, instance: Module.Instance) => any;
  // on: (eventName: string, handle: Module.HookHandler) => any;

  // not first problem: graceful restart & stop
  stop?: () => Promise<void>;
  resume?: () => Promise<void>;
  reload?: () => Promise<void>;
  restart?: () => Promise<void>;
}
