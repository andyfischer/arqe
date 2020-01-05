
import EventEmitter from 'events'

export default class ResponseAsEvents extends EventEmitter {

    first = false;
    streaming = false;
    sentDone = false;

    receive(msg: string) {
        if (msg === '#start') {
            this.streaming = true;
            this.emit('startStreaming');
            return;
        }

        if (msg === '#done') {
            if (!this.sentDone) {
                this.sentDone = true;
                this.emit('done');
            }

            return;
        }

        this.emit('message', msg);

        if (!this.streaming && !this.sentDone) {
            this.emit('done');
            this.sentDone = true;
        }
    }

    receiveCallback() {
        return (msg) => {
            this.receive(msg);
        }
    }

    waitUntilDone() {
        return new Promise(resolve => this.on('done', resolve));
    }
}
