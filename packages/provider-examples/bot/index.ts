import { Bot, Module } from '../../../src/types';
// import { createChain } from '../../chain-of-responsibility';
import EventEmitter = require('node:events');
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
        this.platformHooks = new Map();
        this.options = options;
        this.events = new EventEmitter();
        this.middlewares = new Map();
        this.activeMiddlewareChain = () => {};
    }

    async use (module, options) {
        const { symbol, instance } = await this.createModuleInstance(module, options);
        if (module.provide) this.installProvider(module, instance, symbol);
        if (module.create) this.installPlugin(module, instance, symbol);
        return symbol;
    }

    async remove (symbol: Symbol) {
        const instance = this.instances.get(symbol);
        if (!instance) return;
        if (this.platforms.get(symbol)) this.removeProvider(symbol);
        if (this.plugins.get(symbol)) this.removePlugin(symbol);
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

    async createModuleInstance (module: Module.Interface, options) {
        const instance = await module.instance(options);
        const rtn = {
            symbol: Symbol(`instance[${module.name}]`),
            instance
        };
        return rtn;
    }

    on (hook, handler) {
        this.events.on(hook, handler);
    }

    hookPlatform (symbol: Symbol) {
        const platform = this.platforms.get(symbol);
        // create more handlers later
        const handler = this.handleMessage.bind(this);
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
        this.activeMiddlewareChain = createChain(Array.from(this.middlewares).map(([, messageHandler]) => messageHandler));
    }

    handleMessage (messageEvent) {
        const context = this.createContext(messageEvent);
        this.events.emit('message', context);
    }

    async createContext (event) {
        // transform event from platform to context
    }
}
