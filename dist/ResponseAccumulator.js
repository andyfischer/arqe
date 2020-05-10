"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseAsEvents_1 = __importDefault(require("./ResponseAsEvents"));
class ResponseAccumulator {
    constructor() {
        this.out = null;
        this.events = new ResponseAsEvents_1.default();
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
        return this.events.receiveCallback();
    }
    async waitUntilDone() {
        await this.events.waitUntilDone();
        return this.out;
    }
}
exports.default = ResponseAccumulator;
//# sourceMappingURL=ResponseAccumulator.js.map