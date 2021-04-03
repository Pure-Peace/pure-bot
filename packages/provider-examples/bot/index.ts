import { Bot, Module, Context } from '../../../src/types';
import { createChain } from '../../chain-of-responsibility';
import { EventEmitter } from 'events';
export default class BaseBot implements Bot {
    instances: Map<Symbol, Module.Instance>
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
    events: EventEmitter;
    constructor (options) {
        this.instances = new Map();
        // this.providers = new Map();
        this.platforms = new Map();
        this.platformHooks = new Map();
        this.plugins = new Map();
        this.pluginHooks = new Map();
        this.options = options;
        this.events = new EventEmitter();
        this.middlewares = new Map();
        this.activeMiddlewareChain = () => {};
    }

    async use (module, options) {
        const instance = await module.instance(options);
        return this.#installInstance(module, instance);
    }

    async reuse (module, instance) {
        if ([...this.instances.values()].includes(instance)) throw new Error('instance is already in the bot');
        return this.#installInstance(module, instance);
    }

    // @ts-expect-error: private function not supported yet but it works
    async #installInstance (module, instance) {
        const symbol = Symbol(`instance[${module.name}]`);
        this.instances.set(symbol, instance);
        if (module.provide) this.installProvider(module, instance, symbol);
        if (module.create) this.installPlugin(module, instance, symbol);
        return symbol;
    }

    async remove (symbol: Symbol) {
        const instance = this.instances.get(symbol);
        if (!instance) return;
        if (this.platforms.get(symbol)) this.removeProvider(symbol);
        if (this.plugins.get(symbol)) this.removePlugin(symbol);

        return instance;
    }

    async installProvider (module: Module.Provider, instance, symbol) {
        // this.providers.set(symbol, module);
        const platform = await module.provide.apply(instance);
        this.platforms.set(symbol, platform);
        this.hookPlatform(symbol);
    }

    async removeProvider (symbol) {
        this.removeHookPlatform(symbol);
        this.platforms.delete(symbol);
        this.instances.delete(symbol);
    }

    async installPlugin (module: Module.Plugin, instance, symbol) {
        this.plugins.set(symbol, module);
        this.hookPlugin(symbol);
        if (module.create) this.installPluginMiddleware(symbol);
    }

    async removePlugin (symbol) {
        const plugin = this.plugins.get(symbol);
        this.removeHookPlugin(symbol);
        if (plugin.create) this.removePluginMiddleware(symbol);
        this.plugins.delete(symbol);
        this.instances.delete(symbol);
    }

    on (hook, handler) {
        this.events.on(hook, handler);
    }

    hookPlatform (symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        // create more handlers later
        const handler = (data) => this.handleMessage(data, symbol);
        const handlers = [{ hookName: 'message', handler }];
        this.platformHooks.set(symbol, handlers);
        handlers.forEach(({ hookName, handler }) => platform.source.on(hookName, handler));
    }

    removeHookPlatform (symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        this.platformHooks.get(symbol)
            .map(({ hookName, handler }) => platform.source.off(hookName, handler));
        this.platformHooks.delete(symbol);
    }

    hookPlugin (symbol: Symbol) {
        const plugin = this.plugins.get(symbol);
        const instance = this.instances.get(symbol);
        const hooks = Object.entries(plugin.hooks || {}).map(([hookName, handler]) => {
            return { hookName: hookName, handler: handler.bind(instance) };
        });
        this.pluginHooks.set(symbol, hooks);
        hooks.forEach(({ hookName, handler }) => {
            this.events.on(hookName, handler);
        });
    }

    removeHookPlugin (symbol: Symbol) {
        this.pluginHooks.get(symbol).forEach(({ hookName, handler }) => {
            this.events.off(hookName, handler);
        });
        this.pluginHooks.delete(symbol);
    }

    installPluginMiddleware (symbol) {
        const plugin = this.plugins.get(symbol);
        const instance = this.instances.get(symbol);
        const middleware = plugin.create.apply(instance);
        this.middlewares.set(symbol, middleware);
        this.updateMiddlewareChain();
    }

    removePluginMiddleware (symbol: Symbol) {
        this.middlewares.delete(symbol);
        this.updateMiddlewareChain();
    }

    updateMiddlewareChain () {
        this.activeMiddlewareChain = createChain([...this.middlewares.values()]);
    }

    async handleMessage (messageEvent, symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        const context = await this.createContext(messageEvent, platform);
        this.events.emit('message', context);
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
