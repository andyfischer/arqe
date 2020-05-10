import ResponseAsEvents from './ResponseAsEvents';
export default class ResponseAccumulator {
    events: ResponseAsEvents;
    out: any;
    constructor();
    receiveCallback(): (msg: any) => void;
    waitUntilDone(): Promise<string | string[]>;
}
