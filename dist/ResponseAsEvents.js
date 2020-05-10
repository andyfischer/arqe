"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class ResponseAsEvents extends events_1.default {
    constructor() {
        super(...arguments);
        this.first = false;
        this.streaming = false;
        this.sentDone = false;
    }
    receive(msg) {
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
        };
    }
    waitUntilDone() {
        return new Promise(resolve => this.on('done', resolve));
    }
}
exports.default = ResponseAsEvents;
//# sourceMappingURL=ResponseAsEvents.js.map