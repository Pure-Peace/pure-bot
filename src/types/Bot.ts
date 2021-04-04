import { Module } from './Module';
export interface Bot {
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
