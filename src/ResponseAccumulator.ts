
import ResponseAsEvents from './ResponseAsEvents'

export default class ResponseAccumulator {
    events: ResponseAsEvents
    out = null

    constructor() {
        this.events = new ResponseAsEvents()

        this.events.on('startStreaming', () => {
            this.out = [];
        });

        this.events.on('message', msg => {
            if (this.out === null)
                this.out = msg;
            else
                this.out.push(msg);
        });
    }

    receiveCallback() {
        return this.events.receiveCallback()
    }

    async waitUntilDone(): Promise<string | string[]> {
        await this.events.waitUntilDone();

        return this.out;
    }
}
