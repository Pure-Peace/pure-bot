import { Bot, Module, Context } from '../../../src/types';
import { createChain } from '../../chain-of-responsibility';
import { EventEmitter } from 'events';
type Hooks = Array<{
  hookName: string;
  handler: (...args) => void;
}>;
export default class BaseBot implements Bot {
  instances: Map<Symbol, Module.Instance>;
  filters: Map<Symbol, Module.FilterHandler>;
  platformInterfaces: Map<Symbol, Module.PlatformInterface>;
  platformFeatures: Map<Symbol, Module.Features>;
  receivers: Map<Symbol, Module.Receiver>;
  transmitters: Map<Symbol, Module.Transmitter>;
  platformEventHooks: Map<Symbol, Hooks>;
  plugins: Map<Symbol, Module.Plugin>;
  pluginHooks: Map<Symbol, Hooks>;
  middlewares: Map<Symbol, Module.ChainableHandler>;

  // createChain result
  activeMiddlewareChain: Module.HookHandler;
  options: any;
  inboundEvents: EventEmitter;
  filteredEvents: EventEmitter;
  constructor (options) {
      this.instances = new Map();
      // this.transceivers = new Map();
      this.platformInterfaces = new Map();
      this.receivers = new Map();
      this.transmitters = new Map();
      this.platformFeatures = new Map();
      this.platformEventHooks = new Map();
      this.plugins = new Map();
      this.pluginHooks = new Map();
      this.filters = new Map();
      this.options = options;
      this.inboundEvents = new EventEmitter();
      this.filteredEvents = new EventEmitter();
      this.middlewares = new Map();
      this.activeMiddlewareChain = () => {};
  }

  /**
   * install a module, could be a PlatformInterface, a Plugin or a filter.
   * @param module
   * @param options
   * @returns {Symbol}
   */
  async use (
      module: Module.PlatformInterface | Module.Plugin | Module.Filter,
      options: any = {}
  ) {
      if (!module.instance) { throw new Error('module should have an instance method') }

      const instance = await module.instance(options);
      return this.#installInstance(module, instance);
  }

  /**
   * re-install a module use gived Module instance
   * @param module
   * @param instance
   * @returns {Symbol}
   */
  async reuse (
      module: Module.PlatformInterface | Module.Plugin | Module.Filter,
      instance: Module.Instance
  ) {
      if ([...this.instances.values()].includes(instance)) { throw new Error('instance is already in the bot') }
      return this.#installInstance(module, instance);
  }

  /**
   * real install method only callable from inside class
   * @param module
   * @param instance
   * @returns {Symbol}
   */
  // @ts-expect-error: private function not supported yet but it works
  async #installInstance (module, instance: Module.Instance) {
      const symbol = Symbol(`instance[${module.name}]`);
      this.instances.set(symbol, instance);
      if (module.receiver) this.#installPlatformInterface(module, symbol);
      else if (module.handle) this.#installPlugin(module, symbol);
      else if (module.filter) this.#installFilter(module, symbol);
      else throw new Error('unknown type of Module');
      return symbol;
  }

  /**
   * remove module from processing chain and return the instance of the module, can be re-installed using `Bot.reuse(module, instance)`;
   * @param symbol
   * @returns {Module.Instance}
   */
  async remove (symbol: Symbol) {
      const instance = this.instances.get(symbol);
      if (!instance) throw new Error('instance not exists');

      if (this.platformInterfaces.get(symbol)) { this.#removePlatformInterface(symbol) }
      if (this.plugins.get(symbol)) this.#removePlugin(symbol);
      if (this.filters.get(symbol)) this.#removeFilter(symbol);

      return instance;
  }

  // @ts-expect-error: private function not supported yet but it works
  async #installPlatformInterface (module: Module.PlatformInterface, symbol) {
      this.platformInterfaces.set(symbol, module);
      const instance = this.instances.get(symbol);

      const receiver = await module.receiver.apply(instance);
      const transmitter = await module.transmitter.apply(instance);
      this.receivers.set(symbol, receiver);
      this.transmitters.set(symbol, transmitter);

      this.#listenPlatformEvents(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  async #removePlatformInterface (symbol: Symbol) {
      this.#removePlatformEventsListeners(symbol);
      this.receivers.delete(symbol);
      this.transmitters.delete(symbol);
      this.platformInterfaces.delete(symbol);
      this.instances.delete(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  async #installPlugin (module: Module.Plugin, symbol: Symbol) {
      this.plugins.set(symbol, module);
      this.#hookPlugin(symbol);
      if (module.handle) this.#installPluginMiddleware(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  async #removePlugin (symbol: Symbol) {
      const plugin = this.plugins.get(symbol);
      this.#removeHookPlugin(symbol);
      if (plugin.handle) this.#removePluginMiddleware(symbol);
      this.plugins.delete(symbol);
      this.instances.delete(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  async #installFilter (module: Module.Filter, symbol: Symbol) {
      const instance = this.instances.get(symbol);
      if (!module.filter) return;
      this.filters.set(symbol, module.filter.bind(instance));
  }

  // @ts-expect-error: private function not supported yet but it works
  async #removeFilter (symbol: Symbol) {
      this.filters.delete(symbol);
      this.instances.delete(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  #listenPlatformEvents (symbol: Symbol) {
      const receiver = this.receivers.get(symbol);
      // handle more handlers later
      const handler = (data) => this.inboundMessage(data, symbol);
      const handlers = [{ hookName: 'event', handler }];
      this.platformEventHooks.set(symbol, handlers);
      handlers.forEach(({ hookName, handler }) =>
          receiver.source.on(hookName, handler)
      );
  }

  // @ts-expect-error: private function not supported yet but it works
  #removePlatformEventsListeners (symbol: Symbol) {
      const receiver = this.receivers.get(symbol);
      this.platformEventHooks
          .get(symbol)
          .map(({ hookName, handler }) => receiver.source.off(hookName, handler));
      this.platformEventHooks.delete(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  #hookPlugin (symbol: Symbol) {
      const plugin = this.plugins.get(symbol);
      const instance = this.instances.get(symbol);
      const hooks = Object.entries(plugin.hooks || {}).map(
          ([hookName, handler]) => {
              return { hookName: hookName, handler: handler.bind(instance) };
          }
      );
      this.pluginHooks.set(symbol, hooks);
      hooks.forEach(({ hookName, handler }) => {
          this.filteredEvents.on(hookName, handler);
      });
  }

  // @ts-expect-error: private function not supported yet but it works
  #removeHookPlugin (symbol: Symbol) {
      this.pluginHooks.get(symbol).forEach(({ hookName, handler }) => {
          this.filteredEvents.off(hookName, handler);
      });
      this.pluginHooks.delete(symbol);
  }

  // @ts-expect-error: private function not supported yet but it works
  #installPluginMiddleware (symbol: Symbol) {
      const plugin = this.plugins.get(symbol);
      const instance = this.instances.get(symbol);
      const middleware = plugin.handle.apply(instance);
      this.middlewares.set(symbol, middleware);
      this.#updateMiddlewareChain();
  }

  // @ts-expect-error: private function not supported yet but it works
  #removePluginMiddleware (symbol: Symbol) {
      this.middlewares.delete(symbol);
      this.#updateMiddlewareChain();
  }

  // @ts-expect-error: private function not supported yet but it works
  #updateMiddlewareChain () {
      this.activeMiddlewareChain = createChain([...this.middlewares.values()]);
  }

  /**
   * filtering out message
   * true for message passed the filter
   * @returns {Promise<boolean>}
   */
  async filter (context: Context.Context) {
      for (const [, filter] of this.filters.entries()) {
          if (!(await filter(context))) return false;
          else continue;
      }
      return true;
  }

  /**
   * handle context based on messageEvent (interface not defined yet)
   * @param messageEvent for now it's { rawMessage: string, scope: 'private' | 'public'..., sender: Context.Sender }
   * @param symbol platform symbol
   */
  async inboundMessage (messageEvent, symbol: Symbol) {
      // const platform = this.platformInterfaces.get(symbol);
      const context = await this.createContext(messageEvent, symbol);
      this.handleInboundEvent(context);
  }

  /**
   * handle inbound message
   * emit any message to inboundEvents,
   * filtering out messages use installed filters,
   * emit filtered message to filteredEvents,
   * calls handleFilteredvent method
   * @returns {void}
   */
  async handleInboundEvent (context: Context.Context) {
      // all messages: usable to extract events for chaining events
      this.inboundEvents.emit('event', context);
      if (!(await this.filter(context))) return;
      // filtered message: handle in this bot
      this.filteredEvents.emit('event', context);
      this.handleFilteredEvent(context);
  }

  /**
   * handle filtered message.
   * Chained Plugin handler will be invoked here
   */
  async handleFilteredEvent (context: Context.Context) {
      const platform = context.rawEvent.platform;
      const type = context.rawEvent.type;
      const scope = context.rawEvent.scope || 'default';
      this.filteredEvents.emit(`${type}`, context);
      this.filteredEvents.emit(`${scope}.${type}`, context);
      if (platform) this.filteredEvents.emit(`${platform}.${scope}.${type}`, context);
      this.activeMiddlewareChain(context);
  }

  /**
   * *for test* handle a Context.Context from transceiver event
   * @returns {Promise<Context.Context>}
   */
  async createContext (event: Module.Event, symbol: Symbol) {
      const transmitter = this.transmitters.get(symbol);
      const platformFeatures = this.platformFeatures.get(symbol);
      const platformInterface = this.platformInterfaces.get(symbol);
      const platformName = platformInterface.platform;
      return {
          rawEvent: event,
          transmitter,
          features: platformFeatures,
          ...transmitter,
          ...platformFeatures,
          [event.type]: event[event.type],
          [event.scope]: {
              [event.type]: event[event.type]
          },
          [platformName]: {
              [event.type]: event[event.type],
              [event.scope]: {
                  [event.type]: event[event.type]
              }
          }
      } as Context.Context;
  }
}
