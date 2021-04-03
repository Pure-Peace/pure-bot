import { Bot, Module, Context } from '../../../src/types';
import { createChain } from '../../chain-of-responsibility';
import { EventEmitter } from 'events';
export default class BaseBot implements Bot {
    instances: Map<Symbol, Module.Instance>
    filters: Map<Symbol, Module.FilterHandler>
    // providers: Map<Symbol, Module.Provider>
    platforms: Map<Symbol, Module.Platform>
    platformHooks: Map<Symbol, Array<{
        hookName: string,
        handler: (...args) => void;
    }>>

    plugins: Map<Symbol, Module.Plugin>
    pluginHooks: Map<Symbol, Array<{
        hookName: string,
        handler: (...args) => void;
    }>>

    middlewares: Map<Symbol, Module.ChainableHandler>
    activeMiddlewareChain: Module.HookHandler
    options: any;
    inboundEvents: EventEmitter;
    filteredEvents: EventEmitter;
    constructor (options) {
        this.instances = new Map();
        // this.providers = new Map();
        this.platforms = new Map();
        this.platformHooks = new Map();
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
     * install a module, could be a Provider, a Plugin or a filter.
     * @param module
     * @param options
     * @returns {Symbol}
     */
    async use (module: Module.Provider | Module.Plugin | Module.Filter, options: any = {}) {
        if (!module.instance) throw new Error('module should have an instance method');

        const instance = await module.instance(options);
        return this.#installInstance(module, instance);
    }

    /**
     * re-install a module use gived Module instance
     * @param module
     * @param instance
     * @returns {Symbol}
     */
    async reuse (module: Module.Provider | Module.Plugin | Module.Filter, instance: Module.Instance) {
        if ([...this.instances.values()].includes(instance)) throw new Error('instance is already in the bot');
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
        if (module.provide) this.#installProvider(module, symbol);
        if (module.create) this.#installPlugin(module, symbol);
        if (module.filter) this.#installFilter(module, symbol);
        return symbol;
    }

    /**
     * remove module from processing chain and return the instance of the module, can be re-installed using `Bot.reuse(module, instance)`;
     * @param symbol
     * @returns {Module.Instance}
     */
    async remove (symbol: Symbol) {
        const instance = this.instances.get(symbol);
        if (!instance) return;

        if (this.platforms.get(symbol)) this.#removeProvider(symbol);
        if (this.plugins.get(symbol)) this.#removePlugin(symbol);
        if (this.filters.get(symbol)) this.#removeFilter(symbol);

        return instance;
    }

    // @ts-expect-error: private function not supported yet but it works
    async #installProvider (module: Module.Provider, symbol) {
        const instance = this.instances.get(symbol);
        const platform = await module.provide.apply(instance);
        this.platforms.set(symbol, platform);
        this.#hookPlatform(symbol);
    }

    // @ts-expect-error: private function not supported yet but it works
    async #removeProvider (symbol: Symbol) {
        this.#removeHookPlatform(symbol);
        this.platforms.delete(symbol);
        this.instances.delete(symbol);
    }

    // @ts-expect-error: private function not supported yet but it works
    async #installPlugin (module: Module.Plugin, symbol: Symbol) {
        this.plugins.set(symbol, module);
        this.#hookPlugin(symbol);
        if (module.create) this.#installPluginMiddleware(symbol);
    }

    // @ts-expect-error: private function not supported yet but it works
    async #removePlugin (symbol: Symbol) {
        const plugin = this.plugins.get(symbol);
        this.#removeHookPlugin(symbol);
        if (plugin.create) this.#removePluginMiddleware(symbol);
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
    #hookPlatform (symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        // create more handlers later
        const handler = (data) => this.inboundMessage(data, symbol);
        const handlers = [{ hookName: 'message', handler }];
        this.platformHooks.set(symbol, handlers);
        handlers.forEach(({ hookName, handler }) => platform.source.on(hookName, handler));
    }

    // @ts-expect-error: private function not supported yet but it works
    #removeHookPlatform (symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        this.platformHooks.get(symbol)
            .map(({ hookName, handler }) => platform.source.off(hookName, handler));
        this.platformHooks.delete(symbol);
    }

    // @ts-expect-error: private function not supported yet but it works
    #hookPlugin (symbol: Symbol) {
        const plugin = this.plugins.get(symbol);
        const instance = this.instances.get(symbol);
        const hooks = Object.entries(plugin.hooks || {}).map(([hookName, handler]) => {
            return { hookName: hookName, handler: handler.bind(instance) };
        });
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
        const middleware = plugin.create.apply(instance);
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

    async filter (context) {
        for (const [, filter] of this.filters.entries()) {
            if (!await filter(context)) return false;
            else continue;
        }
        return true;
    }

    async inboundMessage (messageEvent, symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        const context = await this.createContext(messageEvent, platform);
        this.handleInboundMessage(context);
    }

    async handleInboundMessage (context) {
        // all messages: usable to extract events for chaining events
        this.inboundEvents.emit('message', context);
        if (!await this.filter(context)) return;
        // filtered message: handle in this bot
        this.filteredEvents.emit('message', context);
        this.handleFilteredMessage(context);
    }

    async handleFilteredMessage (context) {
        this.activeMiddlewareChain(context);
    }

    async createContext (event, platform) {
        const message: Context.Message = {
            text: event.content
        };
        return {
            message,
            send: platform.send.bind(platform)
        } as Context.MessageContext;
    }
}
