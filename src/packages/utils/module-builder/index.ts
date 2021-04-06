import { Module } from 'types';
const defaultInstanceFunction = (options = {}) => ({ ...options, options });
export { defaultInstanceFunction };
export default class ModuleBuilder {
  module: any

  constructor (instance: Module.InitInstanceFunction = defaultInstanceFunction) {
      this.module = {
          name: 'pure-module-anonymous',
          instance,
          hooks: {},
          database: {},
          features: {}
      };
  }

  instance (module: Module.BaseModule = { instance: defaultInstanceFunction }) {
      this.module = module;
  }

  handle (handler: Module.Plugin['handle']) {
      this.module.handle = handler;
      return this;
  }

  filter (handler: Module.Filter['filter']) {
      this.module.filter = handler;
      return this;
  }

  get hooks () {
      return this.module.hooks;
  }

  get database () {
      return this.module.database;
  }

  get features () {
      return this.module.features;
  }

  export () {
      return this.module;
  }
}
