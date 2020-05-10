/// <reference types="node" />
import ChildProcess from 'child_process';
import { EventEmitter } from 'events';
export declare const printEvents: EventEmitter;
export declare function print(...args: string[]): void;
export declare function printError(err: any): void;
export declare function randomHex(length: number): string;
export declare function readTextLinesSync(filename: string): string[];
export declare function toSet(items: string[]): {
    [key: string]: boolean;
};
export declare function freeze(value: any): any;
export declare function allTrue(items: boolean[]): boolean;
export declare function values(obj: any): any[];
export declare const exec: typeof ChildProcess.exec.__promisify__;
export declare function timedOut(p: Promise<any>, ms: number): Promise<boolean>;
