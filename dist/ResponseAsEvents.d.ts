/// <reference types="node" />
import EventEmitter from 'events';
export default class ResponseAsEvents extends EventEmitter {
    first: boolean;
    streaming: boolean;
    sentDone: boolean;
    receive(msg: string): void;
    receiveCallback(): (msg: any) => void;
    waitUntilDone(): Promise<unknown>;
}
