import { showBanner } from './banner';
declare const formatting: any;
declare const memory: any;
declare class Duration {
    start: bigint;
    end: bigint;
    duration: bigint;
    isElapsed: boolean;
    constructor();
    restart(): void;
    elapsed(): this;
    digit(): bigint;
    format(): string;
}
declare const isAsyncFn: (func: any) => boolean;
declare const delay: (duration: number) => Promise<unknown>;
export { Duration, isAsyncFn, showBanner, delay, formatting, memory };
//# sourceMappingURL=index.d.ts.map