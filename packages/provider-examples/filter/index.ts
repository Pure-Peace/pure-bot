import { Module } from '../../../src/types';
export default {
    name: 'pure-filter-user-id-whitelist',
    instance (options) {
        return {
            users: [...options.users]
        };
    },
    filter (context) {
        return this.users.length && this.users.includes(context.sender?.id);
    }
} as Module.Filter;
